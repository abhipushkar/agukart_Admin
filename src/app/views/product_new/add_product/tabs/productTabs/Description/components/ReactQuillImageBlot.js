import Quill from "quill";

const ImageBlot = Quill.import("formats/image");

class ReactQuillImageBlot extends ImageBlot {
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

ReactQuillImageBlot.blotName = "image";
ReactQuillImageBlot.tagName = "IMG";

Quill.register(ReactQuillImageBlot);
export default ReactQuillImageBlot;

