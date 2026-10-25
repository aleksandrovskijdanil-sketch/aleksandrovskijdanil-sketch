// InDesign: Файл → Сценарии → Обзор… → выбрать этот файл.
// Открывает Системы_вывода_брошюра.idml, сохраняет .indd, экспортирует PDF и упаковывает
// (папки «Шрифты» и «Связи» создаёт сама InDesign). Результат — рядом с IDML.
#target indesign
var idml = File.openDialog("Выберите Системы_вывода_брошюра.idml", "*.idml");
if (idml) {
    var doc = app.open(idml);
    var dir = idml.parent;
    doc.save(new File(dir + "/Системы_вывода_брошюра.indd"));
    app.pdfExportPreferences.useDocumentBleedWithPDF = true;
    doc.exportFile(ExportFormat.PDF_TYPE, new File(dir + "/Системы_вывода_брошюра_InDesign.pdf"), false, app.pdfExportPresets.item(0));
    var pack = new Folder(dir + "/Системы_вывода_брошюра_упаковано");
    doc.packageForPrint(pack, true, true, true, false, true, true, true, "", false);
    alert("Готово: INDD, PDF и упакованная папка лежат рядом с IDML.");
}
