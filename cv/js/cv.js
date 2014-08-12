/*
 * Copyright (C) 2014  Maxime Falaize
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var cvApp = angular.module("cvApp", [
    "cvControllers"
]);

var cvControllers = angular.module("cvControllers", []);

cvControllers.controller("CVController", ["$scope", "$http", "$sce",
    function($scope, $http, $sce) {
        $scope.printCV = function() {
            getImageFromUrl("img/" + $scope.cv.photoPath, function(img) {
                var doc = pdfContent($scope.cv, $scope.locale, img);
                doc.output("datauri");
            });
        };
        $scope.downloadCV = function() {
            getImageFromUrl("img/" + $scope.cv.photoPath, function(img) {
                var doc = pdfContent($scope.cv, $scope.locale, img);
                doc.save("cv_" + angular.lowercase($scope.cv.firstName) + "_" + angular.lowercase($scope.cv.lastName) + ".pdf");
            });
        };

        // Function to change the locale
        $scope.changeLocale = function(locale, localeFile, dataFile) {
            $("html").attr("lang", locale);
            loadLocaleAndCV($scope, $http, $sce, localeFile, dataFile);
        };

        $http.get("locale/locales.json").success(function(data) {
            $scope.supportedLocales = data.supportedLocales;
            for (var i = 0; i < data.supportedLocales.length; i++) {
                var locale = data.supportedLocales[i];
                if (locale.default) {
                    $scope.changeLocale(locale.locale, locale.localeFile, locale.dataFile);
                    break;
                }
            }
        });

        $scope.$on("$includeContentLoaded", function() {
            $scope.onReady = onReady;
        });
    }]);

function loadLocaleAndCV($scope, $http, $sce, localeFile, dataFile) {
    $http.get("locale/" + localeFile).success(function(data) {
        data.htmlCaptionSkills = $sce.trustAsHtml(data.htmlCaptionSkills);
        data.htmlContributionsInfos = $sce.trustAsHtml(data.htmlContributionsInfos);
        data.htmlAboutThisSite = $sce.trustAsHtml(data.htmlAboutThisSite);

        $scope.formatAddressHtml = function(address) {
            var htmlAddress = data.htmlAddressFormat;
            $.each(address, function(key, value) {
                htmlAddress = htmlAddress.replace("{" + key + "}", value);
            });
            return $sce.trustAsHtml(htmlAddress);
        };

        $scope.locale = data;

        loadCV($scope, $http, $sce, dataFile);
    });
}

function loadCV($scope, $http, $sce, dataFile) {
    $http.get("data/" + dataFile).success(function(data) {
        if (data.model) {
            data.linkModel = "model/" + data.model + "/" + data.model + ".html";
            data.linkModelHead = "model/" + data.model + "/" + data.model + "-head.html";
        } else {
            data.linkModel = "model/default/default.html";
            data.linkModelHead = "model/default/default-head.html";
        }

        if (data.pdfModel) {
            data.linkPdfModel = "pdfmodel/" + data.pdfModel + ".js";
        } else {
            data.linkPdfModel = "pdfmodel/default.js";
        }

        // HTML escaping
        data.htmlPresentation = $sce.trustAsHtml(data.htmlPresentation);

        // age calculation
        var temp = new Date();
        temp.setFullYear(data.birthDate.year);
        temp.setMonth(data.birthDate.month - 1);
        temp.setDate(data.birthDate.day);
        var duration = diffDate(temp, new Date());
        data.age = stringFormatDuration($scope, duration);

        // experience calculation
        temp = new Date();
        temp.setFullYear(data.currentJobFirstExperienceDate.year);
        temp.setMonth(data.currentJobFirstExperienceDate.month - 1);
        duration = diffDate(temp, new Date());
        data.experienceDuration = stringFormatDuration($scope, duration);

        // pastimes duration calculation
        if (data.miscellaneous && data.miscellaneous.pastimes) {
            for (var i = 0; i < data.miscellaneous.pastimes.length; i++) {
                var pastime = data.miscellaneous.pastimes[i];
                temp = new Date();
                temp.setFullYear(pastime.beginYear);
                duration = diffDate(temp, new Date());
                pastime.duration = stringFormatDuration($scope, duration);
            }
        }

        // Generation date formatting
        temp = new Date();
        temp.setFullYear(data.generationDate.year);
        temp.setMonth(data.generationDate.month - 1);
        temp.setDate(data.generationDate.day);
        data.generationDateFormat = temp.toLocaleDateString();

        // Mission description HTML escaping
        if (data.workExperience) {
            angular.forEach(data.workExperience, function(workExperience) {
                angular.forEach(workExperience.missions, function(mission) {
                    mission.description = $sce.trustAsHtml(mission.description);
                });
            });
        }

        // Skills last update formatting
        if (data.lastSkillsUpdate !== undefined) {
            temp = new Date();
            temp.setFullYear(data.lastSkillsUpdate.year);
            temp.setMonth(data.lastSkillsUpdate.month - 1);
            temp.setDate(data.lastSkillsUpdate.day);
            data.lastSkillsUpdateFormat = temp.toLocaleDateString();
        }

        // skills reformatting
        if (data.skills) {
            for (var i = 0; i < data.skills.length; i++) {
                var skill = data.skills[i];
                for (var j = 0; j < skill.types.length; j++) {
                    var type = skill.types[j];
                    type.actualSkills = [];
                    for (var k = 0; k < type.categories.length; k++) {
                        var category = type.categories[k];
                        for (var l = 0; l < category.skills.length; l++) {
                            var actualSkill = category.skills[l];
                            if (l === 0) {
                                actualSkill.rowspan = category.skills.length;
                            }
                            actualSkill.category = category.name;
                            // HTML escaping
                            actualSkill.htmlDescription = $sce.trustAsHtml(actualSkill.htmlDescription);
                        }
                        type.actualSkills = type.actualSkills.concat(category.skills);
                    }
                }
            }
        }

        $scope.cv = data;
    });
}

function stringFormatDuration($scope, duration) {
    var res = "";
    if (duration > 1) {
        res = String.format($scope.locale.durationValueFormatPlural, duration);
    } else {
        res = String.format($scope.locale.durationValueFormatSingle, duration);
    }
    return res;
}

/**
 * Returns the difference between two dates in integer years.
 *
 * @param {Date} dateBefore The older date.
 * @param {Date} dateAfter The newer date.
 * @returns {Number} Retourne
 */
function diffDate(dateBefore, dateAfter) {
    var dif = dateAfter.getFullYear() - dateBefore.getFullYear();

    if (dateAfter.getMonth() < dateBefore.getMonth()) {
        dif--;
    } else if (dateAfter.getMonth() === dateBefore.getMonth()) {
        if (dateAfter.getDate() < dateBefore.getDate()) {
            dif--;
        }
    }

    return dif;
}

String.format = function() {
    var s = arguments[0];
    if (s !== undefined) {
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }
    }

    return s;
};

function onReady() {
    // This function can be overriden in the HTML model.
}

function getImageFromUrl(url, callback) {
    var img = new Image, data, ret = {data: null, pending: true};

    img.onError = function() {
        throw new Error('Cannot load image: "' + url + '"');
    };
    img.onload = function() {
        var canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Grab the image as a jpeg encoded in base64, but only the data
        data = canvas.toDataURL('image/jpeg').slice('data:image/jpeg;base64,'.length);
        // Convert the data to binary form
        data = atob(data);
        document.body.removeChild(canvas);

        ret['data'] = data;
        ret['pending'] = false;

        if (typeof callback === 'function') {
            callback(data);
        }
    };
    img.src = url;

    return ret;
}

(function(jsPDFAPI) {
    jsPDFAPI.getTextWidth = function(txt) {
        var fontName = this.internal.getFont().fontName;
        var fontSize = this.table_font_size || this.internal.getFontSize();
        var fontStyle = this.internal.getFont().fontStyle;
        // value defined in an empirical way
        var widthDiv = 614 / 185;

        var text = document.createElement('font');
        text.id = "jsPDFCell";
        text.style.fontStyle = fontStyle;
        text.style.fontName = fontName;
        text.style.fontSize = fontSize + 'pt';
        $(text).text(txt);

        document.body.appendChild(text);

        var width = text.offsetWidth / widthDiv;

        document.body.removeChild(text);

        return width;
    };
    
    jsPDFAPI.getHtmlText = function(txt) {
        var text = document.createElement('font');
        text.id = "jsPDFCell";
        $(text).html(txt);
        
        return $(text).text();
    };
})(jsPDF.API);