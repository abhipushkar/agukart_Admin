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

const QuillDesShopPolicy = ({ formValues, setFormValues, setErrors }) => {
  const handleChange = (html) => {
    setFormValues((prev)=>({...prev,shopPolicy:html}));
  };
  useEffect(() => {
    Quill.register(CustomImageBlot);
  }, []);

  return (
    <ReactQuill
      style={{ height: "245px" }}
      theme="snow"
      onBlur={() => {
        if (!formValues.shopPolicy || formValues.shopPolicy === "<p><br></p>") {
          setErrors((prev)=>({...prev,shopPolicy:"Shop policy is Required"}));
        }
      }}
      value={setFormValues.shopPolicy === "<p><br></p>" ? "" : formValues.shopPolicy}
      onChange={(html) => {
        handleChange(html);
        setErrors((prev)=>({...prev,shopPolicy:""}));
      }}
      modules={modules}
      formats={formats}
      bounds={"#root"}
      placeholder="Shop Policy"
    />
  );
};

export default memo(QuillDesShopPolicy);
