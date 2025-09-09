import React, { memo, useCallback, useEffect, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import CustomImageBlot from "./CustomImageBlot";

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

const QuillDes = ({ formValues, setFormValues, setErrors }) => {
  const handleChange = (html) => {
    setFormValues((prev) => ({ ...prev, description: html }));
  };
  useEffect(() => {
    Quill.register(CustomImageBlot);
  }, []);

  return (
    <ReactQuill
      style={{ height: "245px" }}
      theme="snow"
      onBlur={() => {
        if (!formValues.description || formValues.description === "<p><br></p>") {
          setErrors((prev) => ({ ...prev, description: "Description is Required" }));
        }
      }}
      value={setFormValues.description === "<p><br></p>" ? "" : formValues.description}
      onChange={(html) => {
        handleChange(html);
        setErrors((prev) => ({ ...prev, description: "" }));
      }}
      modules={modules}
      formats={formats}
      bounds={"#root"}
      placeholder="Description"
    />
  );
};

export default memo(QuillDes);
