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

$.event.props.push('dataTransfer');
var id = 0, i = 0, $this;

/**
 * Utils methods to update the CV model between two versions.
 */
var updateCVUtils = {
    /**
     * Add or update an attribute in fields with particular key.
     * 
     * @param {string} fieldKey The field key to modify the attribute.
     * @param {string} fieldAttributeKey The attribute name.
     * @param {string} fieldAttributeValue The attribute value.
     * @param $cv The cv model.
     */
    addOrUpdateFieldAttribute: function(fieldKey, fieldAttributeKey, fieldAttributeValue, $cv) {
        var splitKeys = fieldKey.split("/");

        for (var locale in $cv) {
            var indexSplit = 0;

            var lookupField = function(f, index) {
                if (f.key === splitKeys[indexSplit]) {
                    if (indexSplit < (splitKeys.length - 1)) {
                        // In this case, the field's input type is a panel
                        indexSplit++;

                        // Search the field into the fieldsTemplate
                        angular.forEach(f.fieldsTemplate, lookupField);

                        // Search the field into each fields in the panel
                        angular.forEach(f.panels, function(panel) {
                            angular.forEach(panel.fields, lookupField);
                        });

                        indexSplit--;
                    } else {
                        // This is the field we looked for
                        f[fieldAttributeKey] = fieldAttributeValue;
                    }
                }
            };

            angular.forEach($cv[locale].fields, lookupField);
        }
    },
    /**
     * Insert a field after or before another in the angular model.
     *
     * @param field The field object to insert with at least the key attribute. If not defined
     * the keyLabel attribute take the key attribute value, inputType attribute take the "text".
     * @param {string} fieldKey The field key to add the field after (or before). If the field is
     * contained into another, you can add slashes to the key to specify the complete path.
     * For example, you can use the key "workExperience/endDate" to add a field after the
     * "end date" field contained into the "work experience" panel.
     * @param {boolean) isBefore if true, the field is inserted before the field associated with
     * the fieldKey attribute.
     * @param $cv The cv model.
     */
    insertField: function(field, fieldKey, isBefore, $cv) {
        // Set field default values
        if (field.keyLabel === undefined) {
            field.keyLabel = field.key;
        }

        if (field.inputType === undefined) {
            field.inputType = "text";
        }

        var splitKeys = fieldKey.split("/");

        for (var locale in $cv) {
            var indexSplit = 0;
            var parent = $cv[locale].fields;
            var keepGoing = true;

            var lookupField = function(f, index) {
                if (keepGoing) {
                    if (f.key === splitKeys[indexSplit]) {
                        if (indexSplit < (splitKeys.length - 1)) {
                            // In this case, the field's input type is a panel
                            indexSplit++;

                            // Search the field into the fieldsTemplate
                            parent = f.fieldsTemplate;
                            angular.forEach(f.fieldsTemplate, lookupField);
                            keepGoing = true;

                            // Search the field into each fields in the panel
                            angular.forEach(f.panels, function(panel) {
                                parent = panel.fields;
                                angular.forEach(panel.fields, lookupField);
                                keepGoing = true;
                            });

                            indexSplit--;
                        } else {
                            // This is the field we looked for
                            var indexNew = index + 1;
                            if (isBefore) {
                                indexNew = index;
                            }

                            var newField = angular.copy(field);
                            newField.id = generateUniqueId();

                            parent.splice(indexNew, 0, newField);
                            keepGoing = false;
                        }
                    }
                }
            };

            angular.forEach($cv[locale].fields, lookupField);
        }
    }
};

/**
 * Generate a unique Id for each call.
 *
 * @returns {String} The id.
 */
function generateUniqueId() {
    return "ui-id-" + id++;
}

/**
 * Convert the base64 string to ArrayBuffer.
 *
 * @param {type} base64 The base64 string to convert.
 * @returns {convertBase64ToArrayBuffer.ascii.buffer}
 */
function convertBase64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        var ascii = binary_string.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
}

/**
 * Remove an object from an array.
 *
 * @param {Array} array
 * @param {String} idProperty
 * @param {Object} objectToRemove
 * @returns {Array|removeFromArray.res} A new instance of the array without the removed object.
 */
function removeFromArray(array, idProperty, objectToRemove) {
    var res = new Array();
    angular.forEach(array, function(object, index) {
        if (object[idProperty] !== objectToRemove[idProperty]) {
            res.push(object);
        }
    });
    return res;
}

var cvGeneratorApp = angular.module("cvGeneratorApp", [
    "cvGeneratorControllers",
    "ngAnimate",
    "cvGeneratorDirectives"
]);

cvGeneratorApp.animation(".animation", function() {
    return {
        enter: function(element, done) {
            // We hide immediately before showing because the element cannot be set
            // with display: none as it is not displayed at the first page load.
            // This workaround is invisible for our eyes.
            $(element).hide();
            $(element).show("slow");
        },
        leave: function(element, done) {
            $(element).hide("slow", function() {
                $(element).remove();
            });
        }
    };
});

var cvGeneratorDirectives = angular.module("cvGeneratorDirectives", []);

cvGeneratorDirectives.directive("ngBindTemplateExt", [function() {
        /*
         * This directive allows to use a ng-bind template from the data-fields.json.
         * Example : ng-bind-template-ext="test.template, test.default" will evaluate
         * the test.template value from the element angular scope as a ng-bind-template
         * attribute. The value after the comma will be evaluated in the element angular
         * scope as a default value if the value is undefined or empty string. The default
         * value is optional and if it is not specified, it will be "Temp".
         */
        return {
            link: function link(scope, element, attrs) {
                var template = attrs.ngBindTemplateExt.split(",")[0].trim();
                var defaultValue = "Temp";
                if (attrs.ngBindTemplateExt.indexOf(",") !== -1) {
                    defaultValue = scope.$eval(attrs.ngBindTemplateExt.split(",")[1].trim());
                }
                var value = scope.$eval(template);
                if (value === undefined) {
                    element.text(defaultValue);
                } else {
                    scope.$watch(value, function(value2) {
                        if (value2 === undefined || value2 === "") {
                            element.text(defaultValue);
                        } else {
                            element.text(value2);
                        }
                    });
                }
            }
        };
    }]).directive("ngFileChange", [function() {
        /*
         * This directive is a ng-change directive for file input (because the
         * ng-change directive does not work with file input).
         * You can use "this" in the attribute.
         */
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                element.on("change", function() {
                    scope.this = element;
                    scope.$eval(attrs.ngFileChange);
                    delete scope.this;
                });
            }
        };
    }]);

var cvGeneratorControllers = angular.module("cvGeneratorControllers", []);

cvGeneratorControllers.controller("CVGeneratorController", ["$scope", "$http", "$window",
    function($scope, $http, $window) {
        // We hide the form at the beginning
        $scope.showGenerator = false;
        // Selected locale default value to english
        $scope.selectedLocale = "en_US";

        // We show the modal panel to choose our language
        $("#localeModal").modal("show");

        /**
         * Do a click to the hidden input field to let the user choose a file.
         *
         * @returns {undefined}
         */
        $scope.loadCV = function() {
            $("#savedFile").click();
        };

        /**
         * Load the CV from the file selected in the field. It just replaces the angular model
         * and compare the actual app version with the app version in the file. If they are
         * different, we update the model for the newer version (if needed).
         *
         * @param {type} input The input field from which you select the file.
         * @returns {undefined}
         */
        $scope.loadSavedFile = function(input) {
            var file = input[0].files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var content = e.target.result;
                    var saveFile = angular.fromJson(content);

                    // We update the id global variable
                    var matchIds = content.match(/ui-id-[0-9]+/g);
                    angular.forEach(matchIds, function(match, index) {
                        var matchId = match.substring(6, match.length);
                        if (parseInt(id) < parseInt(matchId)) {
                            id = matchId;
                        }
                    });
                    id++;

                    // We delete all the saved file's locales from the supported list and
                    // reselect the first input
                    for (var locale in saveFile.cv) {
                        var localeObject = new Object();
                        localeObject.locale = locale;
                        $scope.supportedLocales = removeFromArray($scope.supportedLocales, "locale", localeObject);
                        if ($scope.supportedLocales.length > 0) {
                            $scope.selectedLocale = $scope.supportedLocales[0].locale;
                        }
                    }

                    if (saveFile.version !== "@VERSION@") {
                        // We retrieve the versions.json to know how many versions
                        // there are from the save file app version
                        $http.get("version/versions.json").success(function(data) {
                            var scriptsToLoad = new Array();
                            var start = false;
                            angular.forEach(data.versions, function(version, index) {
                                if (start) {
                                    // Add a convention named update script file to the list
                                    scriptsToLoad.push("update-" + data.versions[index - 1].version + "-to-" + version.version + ".js");
                                }
                                if (version.version === saveFile.version) {
                                    start = true;
                                }
                            });

                            if (scriptsToLoad.length === 0) {
                                $scope.cv = saveFile.cv;
                                $scope.$apply();
                            } else {
                                // We load each update script we need to run (if they exist)
                                angular.forEach(scriptsToLoad, function(script, index) {
                                    var request = $.ajax({
                                        url: "version/scripts/" + script,
                                        dataType: "script"
                                    });

                                    request.always(function(data, textStatus) {
                                        try {
                                            // Execute the function loaded in the script
                                            saveFile.cv = updateVersion(saveFile.cv);
                                        } catch (ex) {
                                            // if the file doesn't exists
                                        }

                                        // If this is the last script, we apply the generated model
                                        if (index === (scriptsToLoad.length - 1)) {
                                            $scope.cv = saveFile.cv;
                                            $scope.$apply();
                                        }
                                    })
                                });
                            }
                        });
                    } else {
                        $scope.cv = saveFile.cv;
                        $scope.$apply();
                    }
                };
                reader.readAsText(file);
            }
        };

        /**
         * Add a new panel for panel fields.
         *
         * @param {type} field The panel field to add the new panel to.
         * @returns {undefined}
         */
        $scope.addPanel = function(field) {
            if (field.panels === undefined) {
                field.panels = new Array();
            }

            var subField = new Object();
            subField.fields = angular.copy(field.fieldsTemplate);

            // Unique id generation
            subField.id = generateUniqueId();
            angular.forEach(subField.fields, function(f, index) {
                f.id = generateUniqueId();

                // Special case for option onchange fields
                if (f.options) {
                    angular.forEach(f.options, function(option, indexOption) {
                        if (option.onchange) {
                            angular.forEach(option.onchange, function(onchange, indexOnchange) {
                                onchange.id = generateUniqueId();
                            });
                        }
                    });
                }
            });

            field.panels.unshift(subField);
        };

        /**
         * Remove the panel from a panel field.
         *
         * @param {type} field The panel field to remove the panel from.
         * @param {type} panel The panel to remove.
         * @returns {undefined}
         */
        $scope.removePanel = function(field, panel) {
            field.panels = removeFromArray(field.panels, "id", panel);
        };

        /**
         * Move the panel to an upper or lower position in the panel field.
         *
         * @param index The index of the panel to move.
         * @param {boolean} up True if we have to move to an upper position. False
         * for a lower position.
         * @param field The panel field to move the panel from.
         */
        $scope.movePanel = function(index, up, field) {
            var panel = field.panels.splice(index, 1);
            if (up) {
                field.panels.splice(index - 1, 0, panel[0]);
            } else {
                field.panels.splice(index + 1, 0, panel[0]);
            }
        };

        /**
         * Load the image contained as a file by the input parameter and add its content
         * into the field parameter.
         * The image is loaded in a base64 format.
         *
         * @param {type} input The form file input which contains the image.
         * @param {type} field The field angular model object to add the image content to.
         * @returns {undefined}
         */
        $scope.loadImage = function(input, field) {
            var image = input[0].files[0];
            if (image) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    var content = reader.result;
                    field.data = content;
                    input.scope().$apply();
                };
                reader.readAsDataURL(image);
            }
        };

        /**
         * Save the CV in a file. It just add the angular model and the app version and
         * converts them to JSON.
         *
         * @returns {undefined}
         */
        $scope.saveCV = function() {
            var exportData = 'data:application/octet-stream;charset=utf-8,';
            var save = new Object();
            save.version = "@VERSION@";
            save.cv = $scope.cv;
            exportData += encodeURIComponent(angular.toJson(save));
            $window.location = exportData;
        };

        /**
         * Generate the CV website as a ZIP file to download.
         *
         * @returns {undefined}
         */
        $scope.generateCV = function() {
            var zip = new JSZip();

            var lastName, firstName, model, pdfModel, photo = null;

            // Fill the variables from the model
            for (var cvLocale in $scope.cv) {
                angular.forEach($scope.cv[cvLocale].fields, function(field, i) {
                    switch (field.key) {
                        case "lastName":
                            lastName = angular.lowercase(field.value);
                            break;
                        case "firstName":
                            firstName = angular.lowercase(field.value);
                            break;
                        case "model":
                            model = field.value;
                            break;
                        case "pdfModel":
                            pdfModel = field.value;
                            break;
                    }
                });
                break;
            }

            // Create the root zip file
            var root = zip.folder("cv-" + lastName + "-" + firstName + "-v@VERSION@");

            // Create the img root folder
            var img = root.folder("img");

            var modelPath = "model/" + model + "/";

            var urls = ["js/cv.js", "index.html", modelPath + model + ".html",
                modelPath + model + "-head.html", modelPath + "index.json", "pdfmodel/" + pdfModel + ".js"];

            var i = 0;
            var url = urls[i];

            var localeFile = new Object();
            localeFile.supportedLocales = new Array();
            angular.forEach($scope.cv, function(localeCv, localeKey) {
                // Generate the locales.json file content
                if ($scope.choosenLocale.locale === localeCv.locale.locale) {
                    localeCv.locale.default = true;
                } else {
                    localeCv.locale.default = false;
                }
                localeFile.supportedLocales.push(localeCv.locale);
                urls.push("locale/" + localeCv.locale.localeFile);

                // We browse the fields to create the data file content for this locale
                var data = new Object();
                var generationDate = new Date();
                data.generationDate = new Object();
                data.generationDate.day = generationDate.getDate();
                data.generationDate.month = generationDate.getMonth() + 1;
                data.generationDate.year = generationDate.getFullYear();
                var dataParent = data;

                var eachFunction = function(field, i) {
                    var key = field.key;
                    var temp = dataParent;
                    if (field.key.indexOf(".") !== -1) {
                        var splitedKey = field.key.split(".");
                        if (data[splitedKey[0]] === undefined) {
                            data[splitedKey[0]] = new Object();
                        }
                        dataParent = data[splitedKey[0]];
                        key = splitedKey[1];
                    }

                    switch (field.inputType) {
                        case "select":
                            dataParent[key] = field.value;
                            angular.forEach(field.options, function(option, j) {
                                if (option.onchange) {
                                    angular.forEach(option.onchange, function(onchange, k) {
                                        var config = dataParent[key + "Config"] = new Object();
                                        config[onchange.key] = onchange.value;
                                    });
                                }
                            });
                            break;
                        case "date":
                            var date = dataParent[key] = new Object();
                            if (field.value) {
                                var dateValues = field.value.split("-");
                                date.day = dateValues[2];
                                date.month = dateValues[1];
                                date.year = dateValues[0];
                            }
                            break;
                        case "panel":
                            var panels = dataParent[key] = new Array();
                            angular.forEach(field.panels, function(panel, j) {
                                var temp = dataParent;
                                dataParent = new Object();
                                angular.forEach(panel.fields, eachFunction);
                                panels.push(dataParent);
                                dataParent = temp;
                            });
                            break;
                        case "image":
                            if (field.data) {
                                var arraybuffer = convertBase64ToArrayBuffer(field.data.split(",")[1]);
                                var path = field.id + ".jpg";

                                // Create the image file in the img folder
                                img.file(path, arraybuffer);

                                // Add information to display the image in the model
                                dataParent[key + "Path"] = path;
                                dataParent[key + "Alt"] = field.id;
                            }
                            break;
                        default:
                            if ($.inArray(key, ["address", "zipCode", "city", "country"]) !== -1) {
                                if (dataParent.address === undefined) {
                                    dataParent.address = new Object();
                                }
                                dataParent.address[key] = field.value;
                            } else {
                                if (field.value === undefined) {
                                    dataParent[key] = "";
                                } else {
                                    dataParent[key] = field.value;
                                }
                            }
                            break;
                    }

                    // We redefine the dataParent if necessary
                    dataParent = temp;
                };

                angular.forEach(localeCv.fields, eachFunction);

                root.folder("data").file(localeCv.locale.dataFile, angular.toJson(data));
            });

            // Create the locales.json file
            root.folder("locale").file("locales.json", angular.toJson(localeFile));

            var getFunction = function(data) {
                var addFile = true;

                // We add to the download urls the files indicated in the index.json
                if (url === modelPath + "index.json") {
                    for (var j = 0; j < data.index.length; j++) {
                        urls.push(modelPath + data.index[j]);
                    }
                    // We don't have to include the index.json file in the final zip
                    addFile = false;
                }

                // Build the folder path string from the url
                var folders = url.split("/");
                var folderString = "";

                for (var j = 0; j < (folders.length - 1); j++) {
                    if (folderString !== "") {
                        folderString += "/";
                    }
                    folderString += folders[j];
                }

                if (data instanceof Object && !(data instanceof ArrayBuffer)) {
                    data = angular.toJson(data);
                }

                if (addFile) {
                    root.folder(folderString).file(folders[folders.length - 1], data);
                }

                i++;
                if (i < urls.length) {
                    url = urls[i];
                    var options = {};
                    var splitUrl = url.split(".");
                    var extension = splitUrl[splitUrl.length - 1];
                    // If the next file to download is an image, we download it as an ArrayBuffer
                    if (extension !== undefined && $.inArray(extension, ["jpg", "jpeg", "png", "gif", "bmp"]) !== -1) {
                        options = {responseType: "arraybuffer"};
                    }
                    $http.get("cv/" + url, options).success(getFunction);
                } else {
                    // If we do not have other url to process, we can generate the zip application
                    var content = zip.generate();
                    $window.location = "data:application/zip;base64," + content;
                }
            };

            $http.get("cv/" + url).success(getFunction);
        };

        /**
         * Get the option from a select field with the field value.
         *
         * @param {type} field The select field to get the option from.
         * @returns {onchange.options|fi.options}
         */
        $scope.getOption = function(field) {
            if (field && field.options && field.value) {
                for (var i = 0; i < field.options.length; i++) {
                    var option = field.options[i];
                    if (option.value === field.value) {
                        return option;
                    }
                }
            }
        };

        /**
         * Load the generator UI and generate the fields for one locale.
         * This function can be call again to add another locale to the CV.
         *
         * @returns {undefined}
         */
        $scope.loadGenerator = function() {
            // We retrieve the locale from the list
            var locale = null;
            for (var i = 0; i < $scope.supportedLocales.length; i++) {
                var l = $scope.supportedLocales[i];
                if (l.locale === $scope.selectedLocale) {
                    locale = $scope.supportedLocales[i];
                    break;
                }
            }

            if (locale !== null) {

                // We activate the locale tab
                $scope.active = locale.locale;

                // We delete the chosen locale from the supported list and
                // reselect the first input
                $scope.supportedLocales = removeFromArray($scope.supportedLocales, "locale", locale);
                if ($scope.supportedLocales.length > 0) {
                    $scope.selectedLocale = $scope.supportedLocales[0].locale;
                }

                if ($scope.cv === undefined) {
                    // This is the first time we choose a language
                    $scope.choosenLocale = locale;

                    // We load the different strings to display them in the selected locale
                    $http.get("cv/locale/" + locale.localeFile).success(function(data) {
                        $http.get("locale/" + locale.localeFile).success(function(data2) {
                            // We concatenate the two locale files
                            for (var key in data2) {
                                data[key] = data2[key];
                            }
                            $scope.locale = data;

                            // We load the fields to display in the form. We do it here
                            // because we need the locale before to add the fields at the
                            // right place in the model.
                            $http.get("data/data-fields.json").success(function(data) {
                                var cv = $scope.cv = new Object();
                                var choosenLocale = cv[locale.locale] = new Object();

                                // Unique id generation for each fields
                                angular.forEach(data.fields, function(field, index) {
                                    field.id = generateUniqueId();

                                    // Special case for option onchange fields
                                    if (field.options) {
                                        angular.forEach(field.options, function(option, indexOption) {
                                            if (option.onchange) {
                                                angular.forEach(option.onchange, function(onchange, indexOnchange) {
                                                    onchange.id = generateUniqueId();
                                                });
                                            }
                                        });
                                    }
                                });

                                choosenLocale.fields = data.fields;
                                choosenLocale.locale = locale;

                                // We show the CV generator
                                $scope.showGenerator = true;
                                $("#localeModal").modal("hide");
                            });
                        });
                    });
                } else {
                    // The default language is already set, we have to add a new language here
                    var choosenLocale = $scope.cv[locale.locale] = new Object();
                    for (var firstLocale in $scope.cv) {
                        var jsonString = angular.toJson($scope.cv[firstLocale].fields);

                        // Generate unique ids for the new language fields
                        var idsToReplace = jsonString.match(/ui-id-[0-9]+/g);
                        angular.forEach(idsToReplace, function(idToReplace, index) {
                            jsonString = jsonString.replace("\"" + idToReplace + "\"", "\"" + generateUniqueId() + "\"");
                        });

                        choosenLocale.fields = angular.copy(angular.fromJson(jsonString));
                        break;
                    }
                    choosenLocale.locale = locale;

                    $("#localeModal").modal("hide");
                }
            }
        };

        /**
         * This function just show the modal panel to choose a language to add.
         *
         * @returns {undefined}
         */
        $scope.addLanguage = function() {
            $("#localeModal").modal("show");
        };

        // Get the supported locales
        $http.get("locale/locales.json").success(function(data) {
            $scope.supportedLocales = data.supportedLocales;
        });
    }]);