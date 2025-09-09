import React, { memo, useCallback, useEffect, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import CustomImageBlot from "./CustomImageBot";
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
    // toggle to add extra line breaks when pasting HTML:
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

const QuillBulletPoints = ({ formData, setFormData }) => {
  const handleChange = (html) => {
    setFormData((prev) => ({
      ...prev,
      bulletPoints: html
    }));
  };
  useEffect(() => {
    Quill.register(CustomImageBlot);
  }, []);

  return (
    <ReactQuill
      theme="snow"
      onChange={handleChange}
      value={formData.bulletPoints}
      modules={modules}
      formats={formats}
      bounds={"#root"}
      style={{ height: "400px", width: "100%" }}
    />
  );
};

export default QuillBulletPoints;
