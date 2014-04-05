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
var cvGeneratorApp = angular.module("cvGeneratorApp", [
    "cvGeneratorControllers"
]);

var cvGeneratorControllers = angular.module("cvGeneratorControllers", []);

cvGeneratorControllers.controller("CVGeneratorController", ["$scope", "$http", "$sce",
    function($scope, $http, $sce) {
        $http.get("data-fields.json").success(function(data) {
            $scope.fields = data.fields;
        });
        $http.get("../locale/fr.json").success(function(data) {
            $scope.locale = data;
        });
    }]);

