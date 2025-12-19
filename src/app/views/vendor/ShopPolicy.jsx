import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React from "react";
import QuillDesShopPolicy from "./vendorShopPolicyEditor/QuillDesShopPolicy";

const ShopPolicy = ({
  formValues,
  setFormValues,
  errors,
  setErrors,
  handleValidate,
  setValue,
  setCheckShopPolicy,
  setMemberTab,
  queryId,
  loading,
  handleVendorSave
}) => {
  const handleNext = () => {
    if (handleValidate("shopPolicy")) {
      setValue("members");
      setCheckShopPolicy(true);
      setMemberTab(true);
    }
  };
  return (
    <>
      <h2>Shop Policy</h2>
      <Box>
        <Box width={"100%"}>
          <Box
            sx={{
              height: "auto", // Set your desired height
              width: "100%"
            }}
          >
            <QuillDesShopPolicy formValues={formValues} setFormValues={setFormValues} setErrors={setErrors} />
          </Box>
          {/* <TextEditor name="shopPolicy" value={formValues?.shopPolicy} setFormValues={setFormValues}/> */}
          {errors.shopPolicy && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#FF3D57",
                marginLeft: "14px",
                marginRight: "14px",
                marginTop: "3px"
              }}
            >
              {errors.shopPolicy}
            </Typography>
          )}
        </Box>
        <Typography component="div" mt={2} textAlign="end">
          {queryId && (
            <Button
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              disabled={loading}
              onClick={handleVendorSave}
              sx={{
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                fontWeight: 500,
                textTransform: "capitalize",
                marginRight: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                "&:hover": {
                  backgroundColor: "#333",
                },
                "&:disabled": {
                  backgroundColor: "#888",
                },
              }}
            >
              Save
            </Button>
          )}

          <Button
            onClick={handleNext}
            sx={{
              backgroundColor: "#43a047", // Green
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontWeight: 500,
              textTransform: "capitalize",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
          >
            Next
          </Button>
        </Typography>

      </Box>
    </>
  );
};

export default ShopPolicy;
