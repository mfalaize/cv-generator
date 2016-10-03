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

function pdfContent(cv, locale, img) {
    var doc = new jsPDF();
    var margin = 20;
    var margin2 = margin + 5;
    var margin3 = margin2 + 5;
    var margin4 = margin3 + 5;
    var lineSize = 210;
    var pageSize = 280;
    var y = 20;
    var yLine = 2; // the margin to underline text

    function addLine(nbLine) {
        if (nbLine === undefined) {
            nbLine = 1;
        }
        y += (nbLine * 5); // 5 is the space for one line

        // automatic break page
        if (y > pageSize) {
            y = 20;
            doc.addPage();
        }
    }

    function addText(marginText, text) {
        var paragraphSplit = text.split("\n");
        for (var i = 0; i < paragraphSplit.length; i++) {
            text = paragraphSplit[i];

            var textWidth = doc.getTextWidth(text);
            var tempString = "";
            // automatic break line
            if ((textWidth + marginText) > lineSize) {
                var split = text.split(" ");
                for (var j = 0; j < split.length; j++) {
                    var tempStringWidth = doc.getTextWidth(tempString);
                    var splitWidth = doc.getTextWidth(split[j]);
                    if ((tempStringWidth + splitWidth + marginText) <= lineSize) {
                        tempString += (split[j] + " ");
                    } else {
                        doc.text(marginText, y, tempString);
                        addLine();
                        tempString = (split[j] + " ");
                    }
                }
            } else {
                tempString = text;
            }
            doc.text(marginText, y, tempString);

            if (i !== (paragraphSplit.length - 1)) {
                addLine();
            }
        }
    }

    function addHtml(marginText, text) {
        text = doc.getHtmlText(text);
        addText(marginText, text);
    }

    doc.setFontType("bold");
    doc.setFontSize(20);
    addText(margin, cv.firstName + " " + angular.uppercase(cv.lastName));

    doc.addImage(img, "JPEG", 158, 13, 36, 47);
    doc.rect(158, 13, 36, 47);

    doc.setFontSize(10);
    doc.setFontType("normal");
    addLine(2);
    var address = cv.address.address + " " + cv.address.zipCode + " " + cv.address.city + ", " + cv.address.country;
    addText(margin, address);

    doc.setFontType("bold");
    addLine();
    addText(margin, cv.mail);
    addLine();
    addText(margin, cv.phone);

    doc.setFontType("normal");
    addLine();
    addText(margin, cv.status);
    addLine();
    addText(margin, cv.age);
    addLine();
    if (cv.miscellaneous.drivingLicence) {
        addText(margin, locale.drivingLicence);
        addLine();
    }
    addText(margin, cv.website);

    doc.setFontSize(16);
    addLine(2);
    addText(margin, String.format(locale.experienceSentence, cv.currentJob, cv.experienceDuration));

    doc.setFontSize(14);
    addLine(2);
    addText(margin, angular.uppercase(locale.education));
    doc.line(margin, y + yLine, 195, y + yLine);

    doc.setFontSize(10);
    addLine();
    if (cv.education) {
        for (var i = 0; i < cv.education.length; i++) {
            var education = cv.education[i];
            if (education.displayOnPdf) {
                doc.setFontType("bold");
                addLine();
                addText(margin2, education.beginDate + " - " + education.endDate);
                doc.setFontType("normal");
                addLine();
                addText(margin2, education.grade);
                addLine();
                addText(margin3, education.school);
            }
        }
    }

    doc.setFontSize(14);
    addLine(2);
    addText(margin, angular.uppercase(locale.workExperience));
    doc.line(margin, y + yLine, 195, y + yLine);

    doc.setFontSize(10);
    addLine();

    if (cv.workExperience) {
        for (var i = 0; i < cv.workExperience.length; i++) {
            var experience = cv.workExperience[i];
            if (experience.displayOnPdf) {
                doc.setFontType("bold");
                addLine();
                addText(margin2, experience.beginDate + " - " + experience.endDate);
                doc.setFontType("normal");
                addLine();
                addText(margin2, experience.job);
                addLine();
                addText(margin3, experience.name + ", " + experience.address.city + " (" + experience.address.country + ").");
                addLine();
                var typeCompany = experience.type;
                if (experience.numberOfEmployees) {
                    typeCompany += " (" + experience.numberOfEmployees;
                    if (experience.revenue) {
                        typeCompany += ", " + experience.revenue;
                    }
                    typeCompany += ")";
                } else if (experience.revenue) {
                    typeCompany += " (" + experience.revenue + ")";
                }
                addText(margin3, typeCompany);

                if (experience.missions) {
                    for (var j = 0; j < experience.missions.length; j++) {
                        var mission = experience.missions[j];
                        addLine();
                        doc.setFontType("normal");
                        var description = "• ";
                        
                        if (mission.customer) {
                            description += mission.customer + " : ";
                        }
                        
                        description += mission.description;
                        
                        if (mission.duration || mission.teamSize) {
                            description += " (";
                            if (mission.duration) {
                                description += mission.duration;
                            }
                            if (mission.duration && mission.teamSize) {
                                description += ", ";
                            } 
                            if (mission.teamSize) {
                                description += mission.teamSize;
                            }
                            description += ")."
                        }
                        
                        addHtml(margin3, description);
                        addLine();
                        doc.setFontType("italic");
                        doc.setTextColor(150);
                        addText(margin4, mission.technologies);
                        doc.setTextColor(0);
                    }
                }
            }
        }
    }

    doc.setFontType("normal");
    doc.setFontSize(14);
    addLine(2);
    addText(margin, angular.uppercase(locale.languages));
    doc.line(margin, y + yLine, 195, y + yLine);

    addLine();

    if (cv.miscellaneous.languages) {
        for (var i = 0; i < cv.miscellaneous.languages.length; i++) {
            var language = cv.miscellaneous.languages[i];
            if (language.displayOnPdf) {
                doc.setFontSize(10);
                doc.setFontType("bold");
                addLine();
                addText(margin2, language.name);

                doc.setFontType("normal");
                addLine();
                addText(margin3, language.level);
            }
        }
    }

    doc.setFontSize(14);
    addLine(2);
    addText(margin, angular.uppercase(locale.miscellaneous));
    doc.line(margin, y + yLine, 195, y + yLine);

    addLine();

    if (cv.miscellaneous.pastimes) {
        for (var i = 0; i < cv.miscellaneous.pastimes.length; i++) {
            var pastime = cv.miscellaneous.pastimes[i];
            if (pastime.displayOnPdf) {
                doc.setFontSize(10);
                doc.setFontType("normal");
                addLine();
                addText(margin2, pastime.name + " (" + pastime.duration + ")");
            }
        }
    }

    return doc;
}