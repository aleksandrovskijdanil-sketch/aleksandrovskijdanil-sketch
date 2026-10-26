// Pack the brochure.
// InDesign: Window > Utilities > Scripts. Right-click the "User" folder > Reveal in Explorer,
// copy this file there, then double-click it in the Scripts panel and pick the IDML.
// It relinks images from the folder next to the IDML, saves .indd, packages
// (fonts + links + INDD + IDML + PDF) and exports a PDF with 5 mm bleed into the package folder.
#target indesign
(function () {
    var BASE = "\u0421\u0438\u0441\u0442\u0435\u043c\u044b_\u0432\u044b\u0432\u043e\u0434\u0430_\u0431\u0440\u043e\u0448\u044e\u0440\u0430";
    var LINKS = "\u0421\u0432\u044f\u0437\u0438";
    var idml = File.openDialog("\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0444\u0430\u0439\u043b \u0421\u0438\u0441\u0442\u0435\u043c\u044b_\u0432\u044b\u0432\u043e\u0434\u0430_\u0431\u0440\u043e\u0448\u044e\u0440\u0430.idml", "*.idml");
    if (!idml) return;
    var oldUI = app.scriptPreferences.userInteractionLevel;
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    try {
        var doc = app.open(idml);
        var dir = idml.parent;
        // relink images if the relative path was not resolved
        for (var i = 0; i < doc.links.length; i++) {
            var l = doc.links[i];
            var f = File(dir.fsName + "/" + LINKS + "/" + l.name);
            if (f.exists && l.status != LinkStatus.NORMAL) { l.relink(f); try { l.update(); } catch (e) {} }
        }
        doc.save(File(dir.fsName + "/" + BASE + ".indd"));
        // PDF preset for the package: High Quality Print (any UI language), else the first one
        var style = app.pdfExportPresets.item(0).name;
        for (var p = 0; p < app.pdfExportPresets.length; p++) {
            var n = app.pdfExportPresets.item(p).name;
            if (/High Quality Print|\u0412\u044b\u0441\u043e\u043a\u043e\u043a\u0430\u0447/i.test(n)) { style = n; break; }
        }
        var pack = Folder(dir.fsName + "/" + BASE + "_\u0443\u043f\u0430\u043a\u043e\u0432\u0430\u043d\u043e");
        pack.create();
        // to, fonts, links, profiles, updateGraphics, hiddenLayers, ignorePreflight, report,
        // includeIdml, includePdf, pdfStyle, docHyphenationOnly, versionComments, forceSave
        doc.packageForPrint(pack, true, true, true, true, true, true, true, true, true, style, false, "", true);
        app.pdfExportPreferences.useDocumentBleedWithPDF = true;
        doc.exportFile(ExportFormat.PDF_TYPE, File(pack.fsName + "/" + BASE + "_\u0441_\u0432\u044b\u043b\u0435\u0442\u0430\u043c\u0438.pdf"), false);
        app.scriptPreferences.userInteractionLevel = oldUI;
        alert("\u0413\u043e\u0442\u043e\u0432\u043e. \u0423\u043f\u0430\u043a\u043e\u0432\u0430\u043d\u043d\u0430\u044f \u043f\u0430\u043f\u043a\u0430: " + pack.fsName);
    } catch (err) {
        app.scriptPreferences.userInteractionLevel = oldUI;
        alert("\u041e\u0448\u0438\u0431\u043a\u0430: " + err + " (line " + err.line + ")");
    }
})();
