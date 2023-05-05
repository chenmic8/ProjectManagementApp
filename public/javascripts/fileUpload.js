FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileEncode
);
// const p = document.createElement("p");
// p.innerHTML = "hellow world";
// console.log("HERE AT THE JSCRIPT");
FilePond.setOptions({
  stylePanelAspectRatio: 5 / 100,
  imageResizeTargetWidth: 100,
  imageResizeTargetHeight: 150,
});

FilePond.parse(document.body);
