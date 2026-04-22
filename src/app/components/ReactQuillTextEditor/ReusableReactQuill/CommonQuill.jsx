import React, { memo, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import CustomImageBlot from "../CustomImageBot";

// ✅ register once globally (safe)
let isRegistered = false;

const registerQuillModules = () => {
    if (isRegistered) return;

    Quill.register("modules/imageResize", ImageResize);
    Quill.register(CustomImageBlot);

    isRegistered = true;
};

const CommonQuill = ({
    value,
    onChange,
    error,
    onError,
    placeholder = "Write here...",
    height = 250,
    required = false,

    // feature flags
    showVideo = true,
    showAlign = false,
    showCodeBlock = false
}) => {

    useEffect(() => {
        registerQuillModules();
    }, []);

    const modules = {
        toolbar: [
            [{ header: "1" }, { header: "2" }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image", ...(showVideo ? ["video"] : [])],
            ...(showAlign ? [[{ align: [] }]] : []),
            ...(showCodeBlock ? [["blockquote", "code-block"]] : []),
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
        "bold", "italic", "underline", "strike",
        "list", "bullet",
        "link", "image",
        ...(showVideo ? ["video"] : []),
        ...(showAlign ? ["align"] : []),
        ...(showCodeBlock ? ["blockquote", "code-block"] : [])
    ];

    const handleBlur = () => {
        if (required && (!value || value === "<p><br></p>")) {
            onError && onError("This field is required");
        }
    };

    return (
        <div>
            <ReactQuill
                theme="snow"
                value={value === "<p><br></p>" ? "" : value}
                onChange={(html) => {
                    onChange(html);
                    if (onError) onError("");
                }}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight: `${height}px` }}
                onBlur={handleBlur}
            />

            {error && (
                <div style={{ fontSize: 12, color: "#FF3D57", marginTop: 8 }}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default memo(CommonQuill);