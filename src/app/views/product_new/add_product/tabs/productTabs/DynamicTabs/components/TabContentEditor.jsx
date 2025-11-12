// ProductDynamicTabs/components/TabContentEditor.jsx
import React, {memo} from "react";
import ReactQuill, {Quill} from "react-quill";
import "react-quill/dist/quill.snow.css";

const TabContentEditor = ({ value, onChange, error }) => {
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
        'header', 'font', 'size', // Add 'font' here
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video',
        'code-block', 'align'
    ];

    const handleChange = (content) => {
        onChange(content);
    };

    return (
        <div>
            <ReactQuill
                theme="snow"
                value={value || ""}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                style={{
                    height: 'auto',
                    minHeight: '100px'
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

export default memo(TabContentEditor);
