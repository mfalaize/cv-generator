/*
 * Copyright (C) 2015  Maxime Falaize
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

/**
 * Update the cv model for the newer app version.
 * Use updateCVUtils methods to update the cv model.
 *
 * @param {type} cv The cv model.
 * @returns {type} the modified cv parameter.
 */
var updateVersion = function(cv) {
    var keySkillField = new Object();
    keySkillField.key = "keySkill";
    keySkillField.inputType = "checkbox";

    updateCVUtils.insertField(keySkillField, "skills/types/categories/skills/name", false, cv);

    angular.forEach(cv, function(cvLocale) {
        angular.forEach(cvLocale, function(fields) {
            angular.forEach(fields, function(field) {
                if (field.key === "model") {
                    angular.forEach(field.options, function(option) {
                        angular.forEach(option.onchange, function(onchange) {
                            angular.forEach(onchange.options, function(op) {
                                op.value = "https:" + op.value;
                            });
                            var newOp = new Object();
                            newOp.label = "Material Design"
                            newOp.value = "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/4.0.2/bootstrap-material-design.min.css";
                            onchange.options.push(newOp);
                        });
                    });
                }
            });
        });
    });

    return cv;
};