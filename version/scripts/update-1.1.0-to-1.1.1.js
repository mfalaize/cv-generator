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

/**
 * Update the cv model for the newer app version.
 * Use updateCVUtils methods to update the cv model.
 *
 * @param {type} cv The cv model.
 * @returns {type} the modified cv parameter.
 */
var updateVersion = function(cv) {
    var logoField = new Object();
    logoField.key = "logo";
    logoField.inputType = "image";

    updateCVUtils.insertField(logoField, "workExperience/name", false, cv);

    var workEnvironmentField = new Object();
    workEnvironmentField.key = "workEnvironment";
    workEnvironmentField.inputType = "textarea";

    updateCVUtils.insertField(workEnvironmentField, "workExperience/missions/technologies", false, cv);

    var commentField = new Object();
    commentField.key = "comment";
    commentField.inputType = "textarea";

    updateCVUtils.insertField(commentField, "workExperience/missions/workEnvironment", false, cv);

    var customerField = new Object();
    customerField.key = "customer";

    updateCVUtils.insertField(customerField, "workExperience/missions/description", true, cv);

    var logoMissionField = new Object();
    logoMissionField.key = "logo";
    logoMissionField.keyLabel = "customerLogo";
    logoMissionField.inputType = "image";

    updateCVUtils.insertField(logoMissionField, "workExperience/missions/customer", false, cv);

    var durationField = new Object();
    durationField.key = "duration";

    updateCVUtils.insertField(durationField, "workExperience/missions/description", false, cv);

    var teamSizeField = new Object();
    teamSizeField.key = "teamSize";

    updateCVUtils.insertField(teamSizeField, "workExperience/missions/duration", false, cv);

    var lastUpdateField = new Object();
    lastUpdateField.key = "lastSkillsUpdate";
    lastUpdateField.inputType = "date";

    updateCVUtils.insertField(lastUpdateField, "miscellaneous.drivingLicence", false, cv);
    
    updateCVUtils.addOrUpdateFieldAttribute("workExperience/missions", "titleTemplate", "panel.fields[0].value", cv);

    return cv;
};