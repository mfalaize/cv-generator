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
/**
 * Update the cv model for the newer app version.
 * @param {type} cv The cv model.
 * @returns {type} the modified cv parameter.
 */
var updateVersion = function(cv) {
    if (cv["en_US"]) {
        var newField = new Object();
        newField.key = "test";
        newField.keyLabel = "test";
        newField.inputType = "text";
        cv["en_US"].fields.push(newField);
    }
    return cv;
};