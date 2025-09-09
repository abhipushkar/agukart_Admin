import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React from "react";
import { useState } from "react";
import QuillDes from "app/components/ReactQuillTextEditor/ReactQuillTextEditor/QuilDes";
import TextEditor from "app/components/TextEditor/TextEditor";

const Description = ({
  formValues,
  setFormValues,
  errors,
  setErrors,
  handleValidate,
  setValue,
  setCheckDescription,
  setStoryTab,
  queryId,
  loading,
  handleVendorSave
}) => {
  const handleNext = () => {
    if (handleValidate("description")) {
      setValue("story");
      setCheckDescription(true);
      setStoryTab(true);
    }
  };
  return (
    <>
      <h2>Description</h2>
      <Box>
        <Box width={"100%"}>
          <Box
            sx={{
              height: "auto", // Set your desired height
              width: "100%"
            }}
          >
            <QuillDes formValues={formValues} setFormValues={setFormValues} setErrors={setErrors} />
          </Box>
          {errors.description && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#FF3D57",
                marginLeft: "14px",
                marginRight: "14px",
                marginTop: "3px"
              }}
            >
              {errors.description}
            </Typography>
          )}
        </Box>
        {/* <TextEditor name="description" value={formValues?.description} setFormValues={setFormValues}/> */}
        <Typography component="div" mt={2} textAlign="end">
          {queryId && (
            <Button
              endIcon={loading ? <CircularProgress size={15} color="inherit" /> : null}
              disabled={loading}
              onClick={handleVendorSave}
              sx={{
                backgroundColor: "#000",           // Black button
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                padding: "6px 18px",
                marginRight: 2,
                fontWeight: 500,
                textTransform: "capitalize",
                "&:hover": {
                  backgroundColor: "#333",         // Darker on hover
                },
                "&:disabled": {
                  backgroundColor: "#888",
                }
              }}
            >
              Save
            </Button>
          )}
          <Button
            onClick={handleNext}
            sx={{
              backgroundColor: "#43a047",          // Green button
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              padding: "6px 18px",
              fontWeight: 500,
              textTransform: "capitalize",
              "&:hover": {
                backgroundColor: "#388e3c",        // Darker green on hover
              }
            }}
          >
            Next
          </Button>
        </Typography>
      </Box>
    </>
  );
};

export default Description;
