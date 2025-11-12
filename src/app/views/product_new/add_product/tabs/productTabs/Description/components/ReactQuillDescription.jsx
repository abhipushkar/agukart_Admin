// Description/components/ReactQuillDescription.jsx
import React, {memo, useEffect} from "react";
import ReactQuill, {Quill} from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react/src/ImageResize";
import CustomImageBlot from "../../../../../../Product/descriptoinTextEditor/CustomImageBot";
import ReactQuillImageBlot from "./ReactQuillImageBlot";

Quill.register("modules/imageResize", ImageResize);

const ReactQuillDescription = ({ value, onChange, error }) => {
    const modules = {
        toolbar: [
            [{ header: "1" }, { header: "2" }, { font: [] }],
            [{ size: [] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
            ["link", "image", "video"],
            ['blockquote', 'code-block'],
            [{ 'align': [] }],
            ['clean']
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
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link', 'image',
        'blockquote', 'code-block',
        'align'
    ];

    const handleChange = (content) => {
        onChange(content);
    };

    useEffect(() => {
        Quill.register(ReactQuillImageBlot);
    }, []);

    return (
        <div>
            <ReactQuill
                theme="snow"
                value={value || ""}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                style={{
                    height: 'auto', // Let it expand naturally
                    minHeight: '300px' // Minimum height only
                }}
                onBlur={() => {
                    if (!value || value === "<p><br></p>") {
                        // Error handling is managed by parent component
                    }
                }}
            />
            {error && (
                <div style={{ fontSize: "12px", color: "#FF3D57", marginTop: "8px" }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default memo(ReactQuillDescription);
