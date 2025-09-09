import React from "react";
import { Box, Grid, Typography, List, ListItem, TextField, Button, Link, CircularProgress } from "@mui/material";

const Info = ({
  formValues,
  setFormValues,
  errors,
  setErrors,
  handleValidate,
  setValue,
  imgUrls,
  setImgUrls,
  setCheckInfo,
  setShopTab,
  queryId,
  loading,
  handleVendorSave
}) => {
  const inputFileRef = React.useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormValues((prev) => ({ ...prev, shopIcon: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImgUrls((prev) => ({ ...prev, shopIconUrl: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (handleValidate("info")) {
      setValue("shop");
      setCheckInfo(true);
      setShopTab(true);
    }
  };

  return (
    <>
      <h2 style={{ marginTop: "0" }}>Info & Appearance</h2>
      <Box p={4} sx={{ border: "1px solid #d6d6d6", borderRadius: "6px" }}>
        <Box pb={3} mb={3} sx={{ borderBottom: "1px solid #d6d6d6" }}>
          <Grid
            container
            spacing={3}
            p={0}
            alignItems={"center"}
            sx={{ margin: "0", width: "100%" }}
          >
            <Grid lg={6} md={6} xs={12} mb={1}>
              <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center" }}>
                <Typography variant="h6" mr={2}>
                  Shop Name : 
                </Typography>
                <List sx={{ display: "flex", alignItems: "center" }}>
                  <ListItem sx={{ width: "auto", padding: "0", marginRight: "16px" }}>
                    <Link
                      href=""
                      sx={{
                        color: "#000",
                        textDecoration: "none",
                        fontSize: "16px",
                        "&:hover": { textDecoration: "underline" }
                      }}
                    >
                      {formValues?.newShopName}
                    </Link>
                  </ListItem>
                </List>
              </Box>
            </Grid>
            {/* <Grid lg={6} md={6} xs={12} mb={1}>
              <Typography component="div" sx={{ display: "flex", justifyContent: "end" }}>
                <Typography sx={{ color: "gray", fontSize: "16px" }}>Open on 5 February</Typography>
              </Typography>
            </Grid> */}
          </Grid>
        </Box>
        <Box py={3} sx={{ borderBottom: "1px solid #d6d6d6" }}>
          <Typography component="div">
            <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
              Shop Title
            </Typography>
            <TextField
              error={errors.shopTitle && true}
              helperText={errors.shopTitle}
              onBlur={() => {
                if (!formValues.shopTitle) {
                  setErrors((prv) => ({ ...prv, shopTitle: "Shop title is required" }));
                }
              }}
              type="text"
              value={formValues.shopTitle}
              onChange={handleChange}
              name="shopTitle"
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  height: "40px"
                }
              }}
            />
          </Typography>
        </Box>
        <Box py={3} sx={{ borderBottom: "1px solid #d6d6d6" }}>
          <Typography component="div">
            <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
              Shop address
            </Typography>
            <TextField
              error={errors.shopAddress && true}
              helperText={errors.shopAddress}
              onBlur={() => {
                if (!formValues.shopAddress) {
                  setErrors((prv) => ({ ...prv, shopAddress: "Shop addrerss is required" }));
                }
              }}
              type="text"
              value={formValues.shopAddress}
              onChange={handleChange}
              name="shopAddress"
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  height: "40px"
                }
              }}
            />
          </Typography>
        </Box>
        <Box py={3} sx={{ borderBottom: "1px solid #d6d6d6" }}>
          <Typography component="div">
            <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
              Shop Icon
            </Typography>
            <Box>
              <Typography>
                <Button
                  sx={{
                    color: "#000",
                    background: "#dedede",
                    borderRadius: "4px",
                    padding: "4px 16px"
                  }}
                  onClick={() => inputFileRef.current.click()}
                >
                  Upload your shop icon
                </Button>
                {errors.shopIcon && (
                  <Typography
                    sx={{
                      fontSize: "12px",
                      color: "#FF3D57",
                      marginLeft: "14px",
                      marginRight: "14px",
                      marginTop: "3px"
                    }}
                  >
                    {errors.shopIcon}
                  </Typography>
                )}
                <input
                  ref={inputFileRef}
                  onChange={handleFileChange}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </Typography>
              {imgUrls?.shopIconUrl && (
                <Typography component="div" mt={3}>
                  <Typography
                    component="div"
                    sx={{ height: "170px", width: "150px", position: "relative" }}
                  >
                    <img
                      src={imgUrls?.shopIconUrl}
                      style={{
                        borderRadius: "4px",
                        height: "170px",
                        width: "150px",
                        objectFit: "cover"
                      }}
                      alt=""
                    />
                  </Typography>
                </Typography>
              )}
              <Typography pt={1}>
                must be jpg, png file samller then 10 MB and at least 500px{" "}
              </Typography>
            </Box>
          </Typography>
        </Box>
        <Box py={3} sx={{ borderBottom: "1px solid #d6d6d6" }}>
          <Typography component="div">
            <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
              Shop Announcement
            </Typography>
            <TextField
              error={errors.shopAnnouncement && true}
              helperText={errors.shopAnnouncement}
              // onBlur={() => {
              //   if (!formValues.shopAnnouncement) {
              //     setErrors((prv) => ({
              //       ...prv,
              //       shopAnnouncement: "Shop Announcement is Required"
              //     }));
              //   }
              // }}
              type="text"
              value={formValues.shopAnnouncement}
              onChange={handleChange}
              name="shopAnnouncement"
              rows={4}
              multiline
              variant="outlined"
              fullWidth
            />
          </Typography>
        </Box>
        <Box py={3}>
          <Typography component="div">
            <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
              Message to Buyers
            </Typography>
            <TextField
              error={errors.msgToBuyers && true}
              helperText={errors.msgToBuyers}
              // onBlur={() => {
              //   if (!formValues.msgToBuyers) {
              //     setErrors((prv) => ({
              //       ...prv,
              //       msgToBuyers: "Message To Buyers is Required"
              //     }));
              //   }
              // }}
              type="text"
              value={formValues.msgToBuyers}
              onChange={handleChange}
              name="msgToBuyers"
              rows={4}
              multiline
              variant="outlined"
              fullWidth
            />
            <Typography mt={1}>
              We include this message on receipt pages and in the email buyers receive when the
              purchase from your shop.
            </Typography>
          </Typography>
        </Box>
      </Box>
      <Typography component="div" mt={2} textAlign="end">
        {queryId && (
          <Button
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            disabled={loading}
            sx={{
              backgroundColor: "#000", // black
              borderRadius: "8px",
              color: "#fff",
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
              }
            }}
            onClick={handleVendorSave}
          >
            Save
          </Button>
        )}
        <Button
          sx={{
            backgroundColor: "#43a047", // green
            borderRadius: "8px",
            color: "#fff",
            padding: "8px 20px",
            fontWeight: 500,
            textTransform: "capitalize",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            "&:hover": {
              backgroundColor: "#388e3c",
            }
          }}
          onClick={handleNext}
        >
          Next
        </Button>
      </Typography>
    </>
  );
};

export default Info;
