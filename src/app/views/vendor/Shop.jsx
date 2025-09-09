import React from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { useState } from "react";

const Shop = ({ formValues, setFormValues, errors, setErrors, handleValidate, setValue, setCheckShop, setShopPolicyTab, queryId, loading, handleVendorSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [error,setError] = useState({newShopName:""});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };

  const handleNext = () => {
    if (handleValidate("shop")) {
      setValue("shopPolicy");
      setCheckShop(true);
      setShopPolicyTab(true);
    }
  };

  const handleSave = () => {
    if (!newShopName.trim()) {
      setError({ newShopName: "New Shop Name is Required" });
      return;
    }
    setFormValues((prev) => ({ ...prev, newShopName: newShopName }));
    setNewShopName("");
    setIsEditing(false);
  };

  return (
    <>
      <h2 style={{ marginTop: "0" }}>Shop Name</h2>
      <Box>
        {/* <Box p={3} mb={3} sx={{ background: "#ffd0d0", borderRadius: "6px" }}>
          <Typography fontSize={17} fontWeight={600}>
            Your account is currently suspended
          </Typography>
          <Typography>
            Etsy has suspended your account privileges. Please check your email for a message
            explaining why, and how to restore your account. If you have further questions, contact{" "}
            <Link href="#" sx={{ textDecoration: "underline", color: "#000" }}>
              Etsy Support
            </Link>
            .
          </Typography>
        </Box> */}
        <Box p={3} mb={3} sx={{ border: "1px solid #545454", borderRadius: "6px" }}>
          <Typography pb={2} fontSize={20} fontWeight={500}>
            What happens when you change your shop name?
          </Typography>
          <Typography component="div" mb={1}>
            <Typography fontSize={17} fontWeight={600}>
              All links to your shop continue to work, and no one can use your previous shop name.
            </Typography>
            <Typography>
              Your shop will have a new URL. Links to your previous shop URLs will redirect to your
              new shop URLs. We use 301 redirects to help maintain your search engine rankings after
              the change.
            </Typography>
          </Typography>
          <Typography component="div" mb={1}>
            <Typography fontSize={17} fontWeight={600}>
              We let people know you changed your shop name.
            </Typography>
            <Typography>
              For 45 days, this icon will appear next to your shop name on shop pages, your profile,
              and shop search results to let people know you recently changed your shop name. People
              who purchased from your shop under the previous name will always see your previous and
              current shop name on their receipts and transaction pages.
            </Typography>
          </Typography>
        </Box>
        <Box p={3} sx={{ border: "1px solid #545454", borderRadius: "6px" }}>
          <Typography component="div" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography fontSize={17} fontWeight={500}>
              Current Shop Name: {formValues.newShopName || "Shopname"}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </Typography>
          {
            errors.newShopName && (
              <Typography color="error" mt={1}>
                {errors.newShopName}
              </Typography>
            )
          }
          {isEditing && (
            <Box mt={2}>
              <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
                New Shop Name
              </Typography>
              <TextField
                error={!!error.newShopName}
                helperText={error.newShopName}
                type="text"
                value={newShopName}
                onBlur={() => {
                  if (!newShopName.trim()) {
                    setError({ newShopName: "New Shop Name is Required" });
                  } else {
                    setError({ newShopName: "" });
                  }                  
                }}
                onChange={(e) => setNewShopName(e.target.value)}
                name="newShopName"
                sx={{ width: "100%", "& .MuiInputBase-root": { height: "40px" } }}
              />
              <Box mt={2} sx={{ display: "flex", gap: "10px" }}>
                <Button variant="contained" color="success" onClick={handleSave}>
                  Save
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        <Typography component="div" mt={2} textAlign="end">
          {queryId && (
            <Button
              onClick={handleVendorSave}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                backgroundColor: "#000",
                color: "#fff",
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
              backgroundColor: "#43a047",
              color: "#fff",
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

export default Shop;
