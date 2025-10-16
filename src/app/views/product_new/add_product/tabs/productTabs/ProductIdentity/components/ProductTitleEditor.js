import React, { memo } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";

Quill.register("modules/imageResize", ImageResize);

const modules = {
    toolbar: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
        ["link", "image", "video"],
        ["clean"]
    ],
    clipboard: {
        matchVisual: false
    },
    imageResize: {
        parchment: Quill.import("parchment"),
        modules: ["Resize", "DisplaySize"]
    }
};

const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video"
];

const ProductTitleEditor = ({ value, onChange, error }) => {
    const handleChange = (html) => {
        onChange(html);
    };

    return (
        <div>
            <ReactQuill
                onBlur={() => {
                    if (!value || value === "<p><br></p>") {
                        // Error handling is now managed by parent component
                    }
                }}
                theme="snow"
                onChange={handleChange}
                value={value === "<p><br></p>" ? "" : value}
                formats={formats}
                bounds={"#root"}
                modules={modules}
            />
            {error && (
                <div style={{ fontSize: "12px", color: "#FF3D57", marginTop: "8px" }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default memo(ProductTitleEditor);
