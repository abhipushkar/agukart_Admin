import Quill from "quill";

const ImageBlot = Quill.import("formats/image");

class CustomImageBlot extends ImageBlot {
  static create(value) {
    let node = super.create(value);
    if (typeof value === "object") {
      node.setAttribute("src", value.url);
      node.setAttribute("width", value.width);
    }
    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute("src"),
      width: node.getAttribute("width")
    };
  }
}

CustomImageBlot.blotName = "image";
CustomImageBlot.tagName = "IMG";

Quill.register(CustomImageBlot);
export default CustomImageBlot;
