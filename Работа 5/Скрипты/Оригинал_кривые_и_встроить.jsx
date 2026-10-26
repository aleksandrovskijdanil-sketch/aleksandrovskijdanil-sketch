// Original: text -> outlines (pages AND masters, auto page numbers become plain text) + embed images.
// InDesign: open the packaged .indd, then Window > Utilities > Scripts > double-click this script.
// The result is saved as a NEW file "<name>_original.indd"; the opened file on disk is not changed.
#target indesign
(function () {
    if (app.documents.length == 0) { alert("\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u0432 InDesign \u0444\u0430\u0439\u043b .indd (\u0438\u0437 \u0443\u043f\u0430\u043a\u043e\u0432\u0430\u043d\u043d\u043e\u0439 \u043f\u0430\u043f\u043a\u0438), \u0437\u0430\u0442\u0435\u043c \u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u0441\u043a\u0440\u0438\u043f\u0442."); return; }
    var doc = app.activeDocument;
    var outFolder = Folder.selectDialog("\u041a\u0443\u0434\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043e\u0440\u0438\u0433\u0438\u043d\u0430\u043b (\u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440, \u043f\u0430\u043f\u043a\u0430 \u00ab\u041e\u0440\u0438\u0433\u0438\u043d\u0430\u043b\u00bb)?");
    if (!outFolder) return;
    var oldUI = app.scriptPreferences.userInteractionLevel;
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
    var rep = { numbers: 0, outlined: 0, failed: 0, overset: 0, embedded: 0, notEmbedded: 0, left: 0 };

    function isFrame(it) { return it && it.constructor && it.constructor.name == "TextFrame"; }
    function hasFrames(it) {
        if (isFrame(it)) return true;
        if (!it.allPageItems) return false;
        var a = it.allPageItems;
        for (var i = 0; i < a.length; i++) if (isFrame(a[i])) return true;
        return false;
    }
    function framesOf(container) {
        var out = [], a = container.allPageItems;
        for (var i = 0; i < a.length; i++) if (isFrame(a[i])) out.push(a[i]);
        return out;
    }
    function fixNumbers(tf, name) {
        var st = tf.parentStory;
        for (var c = st.characters.length - 1; c >= 0; c--) {
            var ch = st.characters[c];
            if (ch.contents == SpecialCharacters.AUTO_PAGE_NUMBER) { ch.contents = name; rep.numbers++; }
        }
    }
    function outline(tf, ids) {
        try { tf.locked = false; } catch (e) {}
        if (tf.overflows) rep.overset++;
        if (tf.contents == "") return;
        try {
            var res = tf.createOutlines(true);
            rep.outlined++;
            if (ids) for (var r = 0; r < res.length; r++) ids[res[r].id] = true;
        } catch (e) { rep.failed++; }
    }

    try {
        doc.layers.everyItem().locked = false;
        var p, m, s, i, page, mi, fr;
        // 1. master text frames -> own copies on every page
        for (p = 0; p < doc.pages.length; p++) {
            page = doc.pages[p];
            mi = page.masterPageItems;
            for (m = 0; m < mi.length; m++) {
                if (!hasFrames(mi[m])) continue;
                try { mi[m].override(page); } catch (e) {}
            }
        }
        // 2. page frames: auto page number -> plain digits, then outlines
        for (s = 0; s < doc.spreads.length; s++) {
            fr = framesOf(doc.spreads[s]);
            for (i = 0; i < fr.length; i++) if (fr[i].parentPage) fixNumbers(fr[i], fr[i].parentPage.name);
            fr = framesOf(doc.spreads[s]);
            for (i = 0; i < fr.length; i++) outline(fr[i], null);
        }
        // 3. master frames -> outlines; hide these new master outlines on pages (pages have their own copies)
        var newIds = {};
        for (s = 0; s < doc.masterSpreads.length; s++) {
            fr = framesOf(doc.masterSpreads[s]);
            for (i = 0; i < fr.length; i++) outline(fr[i], newIds);
        }
        for (p = 0; p < doc.pages.length; p++) {
            page = doc.pages[p];
            mi = page.masterPageItems;
            for (m = mi.length - 1; m >= 0; m--) {
                if (!newIds[mi[m].id]) continue;
                try { mi[m].override(page).remove(); } catch (e) {}
            }
        }
        // 4. embed images (relink from Links / Svyazi next to the document if missing)
        var base = "";
        try { base = doc.filePath.fsName; } catch (e) {}
        for (i = doc.links.length - 1; i >= 0; i--) {
            var lk = doc.links[i];
            if (lk.status == LinkStatus.LINK_EMBEDDED) continue;
            if (lk.status == LinkStatus.LINK_MISSING && base) {
                var cands = [base + "/Links/" + lk.name, base + "/" + "\u0421\u0432\u044f\u0437\u0438" + "/" + lk.name, base + "/" + lk.name];
                for (var k = 0; k < cands.length; k++) {
                    var f = File(cands[k]);
                    if (f.exists) { try { lk.relink(f); } catch (e) {} break; }
                }
            }
            try { if (lk.status == LinkStatus.LINK_OUT_OF_DATE) lk.update(); } catch (e) {}
            try { lk.unlink(); rep.embedded++; } catch (e) { rep.notEmbedded++; }
        }
        // 5. check: no live text left
        for (s = 0; s < doc.spreads.length; s++) rep.left += framesOf(doc.spreads[s]).length;
        for (s = 0; s < doc.masterSpreads.length; s++) rep.left += framesOf(doc.masterSpreads[s]).length;
        // 6. save as a new file
        var out = File(outFolder.fsName + "/" + doc.name.replace(/\.indd$/i, "") + "_\u043e\u0440\u0438\u0433\u0438\u043d\u0430\u043b" + ".indd");
        doc.save(out);
        app.scriptPreferences.userInteractionLevel = oldUI;
        alert("\u0413\u043e\u0442\u043e\u0432\u043e. \u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e: " + out.fsName + "\n\n" +
              "\u041d\u043e\u043c\u0435\u0440\u043e\u0432 \u0441\u0442\u0440\u0430\u043d\u0438\u0446 \u0432\u043f\u0438\u0441\u0430\u043d\u043e \u0442\u0435\u043a\u0441\u0442\u043e\u043c: " + rep.numbers + "\n" + "\u0422\u0435\u043a\u0441\u0442\u043e\u0432\u044b\u0445 \u0440\u0430\u043c\u043e\u043a \u0432 \u043a\u0440\u0438\u0432\u044b\u0435: " + rep.outlined + "\n" +
              "\u0424\u043e\u0442\u043e \u0432\u0441\u0442\u0440\u043e\u0435\u043d\u043e: " + rep.embedded + "\n" + "\u041e\u0441\u0442\u0430\u043b\u043e\u0441\u044c \u0436\u0438\u0432\u043e\u0433\u043e \u0442\u0435\u043a\u0441\u0442\u0430 (\u0440\u0430\u043c\u043e\u043a): " + rep.left +
              (rep.failed ? "\n" + "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043f\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u0432 \u043a\u0440\u0438\u0432\u044b\u0435: " + rep.failed : "") +
              (rep.overset ? "\n" + "\u0420\u0430\u043c\u043e\u043a \u0441 \u043d\u0435\u0432\u043c\u0435\u0441\u0442\u0438\u0432\u0448\u0438\u043c\u0441\u044f \u0442\u0435\u043a\u0441\u0442\u043e\u043c (\u043e\u043d \u043f\u043e\u0442\u0435\u0440\u044f\u0435\u0442\u0441\u044f!): " + rep.overset : "") +
              (rep.notEmbedded ? "\n" + "\u041d\u0435 \u0432\u0441\u0442\u0440\u043e\u0435\u043d\u043e (\u0441\u0432\u044f\u0437\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430): " + rep.notEmbedded : ""));
    } catch (err) {
        app.scriptPreferences.userInteractionLevel = oldUI;
        alert("\u041e\u0448\u0438\u0431\u043a\u0430: " + err + " (line " + err.line + ")");
    }
})();
