import React, { memo, useCallback, useEffect, useState } from "react";
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

const ProductTitleEditor = ({ formData, setFormData, setInputErrors }) => {
  const handleChange = (html) => {
    setFormData((prv) => ({ ...prv, productTitle: html }));
  };
  return (
    <ReactQuill
      onBlur={() => {
        if (!formData.productTitle || formData.productTitle === "<p><br></p>") {
          setInputErrors((prv) => ({ ...prv, productTitle: "Product Title is Required" }));
        }
      }}
      theme="snow"
      onChange={(html) => {
        handleChange(html);
        setInputErrors((prv) => ({ ...prv, productTitle: "" }));
      }}
      value={formData.productTitle === "<p><br></p>" ? "" : formData.productTitle}
      formats={formats}
      bounds={"#root"}
    />
  );
};

export default memo(ProductTitleEditor);
