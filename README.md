CV Generator
============

###Description

This application is a 100% javascript and HTML5/CSS website that fills the following requirements for your CV :

* Website templates.
* Automatic PDF generation.
* PDF templates.
* Easy localization.
* Centralized CV data for better maintainability.
* Module based architecture to easily create new website templates and PDF templates.

You can see a demo [here](http://demo.maxime-falaize.fr).

Note that this application is mainly designed for developers but its architecture allows to enhance it for other jobs.

###Guidelines for users

####Getting started

To create your own CV, fork this repository and modify <code>data/data_{yourLanguage}.json</code> (or create one from existing). The architecture of the json file should be easily understandable. Then change the picture present in <code>img/identity.jpeg</code> by your own.

That's all!

####Manage several languages

To add a language or modify the default language, edit the <code>locale/locale.json</code> file.

####Modify the templates

To change the HTML template, just change the value of the <code>model</code> key at the beginning of your <code>data/data_{yourLanguage}.json</code> file. The value must match with a directory name present in the <code>model</code> directory.

To change the PDF template, it is just the same as the HTML template. Just change the <code>pdfModel</code> value to match a js file name present in the <code>pdfmodel</code> directory.

####Customize the PDF rendering

You can choose what part of your CV you want to export in the PDF file. For that just put a <code>"displayOnPdf": true</code> in your <code>data/data_{yourLanguage}.json</code> for each part you want to see in the PDF.

By default your work experience, education, pastimes and languages are not displayed.

###Fork

Feel free to fork this repository and adapt the content to your own. The following list suggests what types of improvements you can add to the application :

* Add a new language.
* Add a new website template.
* Add a new PDF template.

These improvements should be integrated to the project so if you develop one, please share it by sending a pull request! :)

To discuss other enhancements or report bugs/translation errors, please use the github issue tracker.

###Guidelines for contributors

####Adding a new language

Nothing easier. Copy the <code>locale/fr.json</code> to <code>locale/{yourLanguage}.json</code> and replace all values except the keys.

####Adding a new website template

A website template is identified by its name. You have to give your template a unique name. To see what names are unavailables, see the <code>model</code> directory content.

To create your template, start to create a directory with the template name in the <code>model</code> directory. You can place all the content of your template inside.

Next you have to create two files : <code>{templateName}.html</code> and <code>{templateName}-head.html</code>. The first file will contain all of the HTML body content (without the ```<body>``` element). The second file will contain all of the template specific HTML head content (without the ```<head>```element).

Then you just have to develop your template as you want! Please just follow the same name convention for naming your <code>css</code> directory, <code>js</code> directory and <code>img</code> directory.

####Adding a new PDF template

A PDF template is identified by its name. You have to give your template a unique name. To see what names are unavailables, see the <code>pdfmodel</code> directory content.

To create your template, you have to create a js file with the name of your template.

Then you have to write your template into the ```pdfContent(cv, locale, img)``` function. The <code>cv</code> variable contains all of the json data written in <code>data/data_en.json</code> (or other file for other language). The <code>locale</code> variable contains all of the json data written in <code>locale/en.js</code> (or other file for other language). Finally the <code>img</code> variable contains the identity photo image.

As the PDF is generated with the jsPdf library, the <code>pdfContent</code> function must return the <code>jsPDF</code> object created at the beginning of the function. Your code should start by ```var doc = new jsPDF();```.