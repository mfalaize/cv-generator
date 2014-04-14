/*
 * Copyright (C) 2014 Maxime Falaize
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

function generateUniqueId() {
    return "ui-id-" + id++;
}

function removeField(button) {
    var div = $(button).parents(".panel");
    div.hide("slow", function() {
        div.remove();
    });
}

var cvGeneratorApp = angular.module("cvGeneratorApp", [
    "cvGeneratorControllers",
    "ngAnimate"
]);

cvGeneratorApp.animation(".animation", function() {
    return {
        enter: function(element, done) {
            // We hide immediatly before showing because the element cannot be set
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

var cvGeneratorControllers = angular.module("cvGeneratorControllers", []);

cvGeneratorControllers.controller("CVGeneratorController", ["$scope", "$http", "$sce",
    function($scope, $http, $sce) {
        $scope.loadCV = function() {
            $("#savedFile").click();
        };

        $scope.generateCV = function() {
            var zip = new JSZip();
            var root = zip.folder("cv-generator-@VERSION@");
            var dataFolder = root.folder("data");

            $http.get("cv/data/data_fr.json").success(function(data) {
                dataFolder.file("data_fr.json", JSON.stringify(data));
                var content = zip.generate();
                location.href = "data:application/zip;base64," + content;
            });
        };

        $scope.addField = function(key) {
            var div = $("#" + key).clone();
            div.attr("id", generateUniqueId());
            div.find(".panel-title > a").attr("href", "#collapse" + id);
            div.find(".panel-collapse").attr("id", "collapse" + id);
            $scope.index = id;
            div.appendTo("#" + key + "-append");
            div.show("slow");
            div.on({
                dragstart: function(e) {
                    $this = $(this);
                    i = $(this).index();
                    $(this).find("input").each(function() {
                        $(this).attr("value", $(this).val());
                    });
                    e.dataTransfer.setData("text/html", $(this).html());
                },
                dragover: function(e) {
                    e.preventDefault();
                },
                drop: function(e) {
                    if (i !== $(this).index()) {
                        var data = e.dataTransfer.getData("text/html");
                        $(this).find("input").each(function() {
                            $(this).attr("value", $(this).val());
                        });
                        $this.html($(this).html());
                        $(this).html(data);
                    }
                }
            });
        };

        $scope.getOption = function(field) {
            if (field && field.options && field.value) {
                for (var i = 0; i < field.options.length; i++) {
                    var option = field.options[i];
                    if (option.value === field.value) {
                        return option;
                    }
                }
            }
            return undefined;
        };

        $http.get("data-fields.json").success(function(data) {
            $scope.fields = data.fields;
        });
        $http.get("cv/locale/fr.json").success(function(data) {
            $scope.locale = data;
        });
    }]);