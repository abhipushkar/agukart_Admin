import React, { memo, useCallback, useEffect, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import CustomImageBlot from "./CustomImageBot";
import { useRef } from "react";

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

const QuilDes = ({ formData, setFormData, setInputErrors }) => {
  const handleChange = (html) => {
    setFormData((prev) => ({
      ...prev,
      productDescription: html
    }));
  };
  useEffect(() => {
    Quill.register(CustomImageBlot);
  }, []);

  return (
    <ReactQuill
      theme="snow"
      onBlur={() => {
        if (!formData.productDescription || formData.productDescription === "<p><br></p>") {
          setInputErrors((prv) => ({ ...prv, des: "Description is Required" }));
        }
      }}
      onChange={(html) => {
        handleChange(html);
        setInputErrors((prv) => ({ ...prv, des: "" }));
      }}
      value={formData.productDescription === "<p><br></p>" ? "" : formData.productDescription}
      modules={modules}
      formats={formats}
      bounds={"#root"}
      style={{ height: "400px", width: "100%" }}
    />
  );
};

export default memo(QuilDes);
