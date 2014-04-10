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
var id = 0;

function generateUniqueId() {
    return "ui-id-" + id++;
}

function removeField(button) {
    var div = $(button).parent().parent().parent();
    div.hide("slow", function() {
        div.remove();
    });
}

var cvGeneratorApp = angular.module("cvGeneratorApp", [
    "cvGeneratorControllers"
]);

var cvGeneratorControllers = angular.module("cvGeneratorControllers", []);

cvGeneratorControllers.controller("CVGeneratorController", ["$scope", "$http", "$sce",
    function($scope, $http, $sce) {
        $scope.loadCV = function() {
            $("#savedFile").click();
        };

        $scope.generateCV = function() {
            var zip = new JSZip();
            var root = zip.folder("cv-generator-1.0.0");
            var dataFolder = root.folder("data");

            $http.get("../data/data_fr.json").success(function(data) {
                dataFolder.file("data_fr.json", JSON.stringify(data));
                var content = zip.generate();
                location.href = "data:application/zip;base64," + content;
            });
        };

        $scope.addField = function(key) {
            var div = $("#" + key).clone();
            div.attr("id", generateUniqueId());
            $scope.index = id;
            div.appendTo("#" + key + "-append");
            div.show("slow");
        };

        $http.get("data-fields.json").success(function(data) {
            $scope.fields = data.fields;
        });
        $http.get("../locale/fr.json").success(function(data) {
            $scope.locale = data;
        });
    }]);

