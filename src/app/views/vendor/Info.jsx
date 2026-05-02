import React, { useState } from "react";
import { Box, Grid, Typography, List, ListItem, TextField, Button, Link, CircularProgress, IconButton } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Switch, Checkbox, FormControlLabel
} from "@mui/material";
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
  const [enhanceModalOpen, setEnhanceModalOpen] = useState(false);
  const [hideAI, setHideAI] = useState(false);
  const [acceptAll, setAcceptAll] = useState(false);
  const [enhanceFields, setEnhanceFields] = useState([]);

  const ENHANCE_FIELDS_CONFIG = [
    { key: 'meta_title', label: 'Meta title' },
    { key: 'meta_description', label: 'Meta description' },
    { key: 'meta_keywords', label: 'Meta keywords' },
    { key: 'shopIconAlt', label: 'Icon alt text' },
  ];

  const handleOpenEnhanceModal = () => {
    const fields = ENHANCE_FIELDS_CONFIG.map((f, i) => ({
      id: i,
      key: f.key,
      label: f.label,
      original: formValues[f.key] || "",
      generated: "",
      accepted: false,
    }));
    setEnhanceFields(fields);
    setHideAI(false);
    setAcceptAll(false);
    setEnhanceModalOpen(true);
  };

  const handleCloseEnhanceModal = () => {
    setEnhanceModalOpen(false);
    setEnhanceFields([]);
    setAcceptAll(false);
  };

  const handleAcceptAll = (checked) => {
    setAcceptAll(checked);
    setEnhanceFields(prev => prev.map(f => ({ ...f, accepted: checked })));
  };

  const handleFieldAccept = (id, checked) => {
    const updated = enhanceFields.map(f =>
      f.id === id ? { ...f, accepted: checked } : f
    );
    setEnhanceFields(updated);
    setAcceptAll(updated.every(f => f.accepted));
  };

  const handleGeneratedChange = (id, value) => {
    setEnhanceFields(prev =>
      prev.map(f => f.id === id ? { ...f, generated: value } : f)
    );
  };

  const handleAddToForm = () => {
    const updates = {};
    enhanceFields.forEach(f => {
      if (f.accepted) updates[f.key] = f.original; // original side save hogi
    });
    if (Object.keys(updates).length > 0) {
      setFormValues(prev => ({ ...prev, ...updates }));
    }
    handleCloseEnhanceModal();
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
            <Grid lg={6} md={6} xs={12} mb={1}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AutoAwesomeIcon fontSize="small" />}
                  onClick={handleOpenEnhanceModal}
                  sx={{
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                      borderColor: '#1565c0'
                    }
                  }}
                >
                  Enhance
                </Button>
              </Box>
            </Grid>
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
              // onBlur={() => {
              //   if (!formValues.shopAddress) {
              //     setErrors((prv) => ({ ...prv, shopAddress: "Shop addrerss is required" }));
              //   }
              // }}
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

        {/* Meta Title */}
        {/* Meta Title */}
        <Box py={3} sx={{ borderBottom: "1px solid #d6d6d6" }}>
          <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
            Meta Title
          </Typography>
          <TextField
            name="meta_title"
            value={formValues.meta_title || ""}
            onChange={handleChange}
            error={errors.meta_title && true}
            helperText={errors.meta_title || `${formValues.meta_title?.length || 0}/60`}
            fullWidth
            placeholder="Enter meta title"
            sx={{
              "& .MuiInputBase-root": { height: "40px" }
            }}
          />
        </Box>

        {/* Meta Description */}
        <Box py={3} sx={{ borderBottom: "1px solid #d6d6d6" }}>
          <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
            Meta Description
          </Typography>
          <TextField
            name="meta_description"
            value={formValues.meta_description || ""}
            onChange={handleChange}
            error={errors.meta_description && true}
            helperText={errors.meta_description || `${formValues.meta_description?.length || 0}/160`}
            fullWidth
            multiline
            rows={3}
          />
        </Box>

        {/* Meta Keywords */}
        <Box py={3} sx={{ borderBottom: "1px solid #d6d6d6" }}>
          <Typography pb={1} sx={{ fontSize: "16px", fontWeight: "600" }}>
            Meta Keywords
          </Typography>
          <TextField
            name="meta_keywords"
            value={formValues.meta_keywords || ""}
            onChange={handleChange}
            error={errors.meta_keywords && true}
            helperText={errors.meta_keywords || "Use comma separated keywords"}
            fullWidth
          />
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
              {/* Alt Text for Shop Icon */}
              <Box mt={2}>
                <Typography pb={1} sx={{ fontSize: "14px", fontWeight: "600" }}>
                  Icon Alt Text
                </Typography>

                <TextField
                  name="shopIconAlt"
                  value={formValues.shopIconAlt || ""}
                  onChange={handleChange}
                  placeholder="Describe the shop icon (e.g. brand logo)"
                  fullWidth
                  error={errors.shopIconAlt && true}
                  helperText={errors.shopIconAlt}
                  sx={{
                    "& .MuiInputBase-root": { height: "40px" }
                  }}
                />
              </Box>
              <Typography pt={1}>
                must be jpg, png file samller than 10 MB and at least 500px{" "}
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
      {/* ===== ENHANCE MODAL ===== */}
      <Dialog
        open={enhanceModalOpen}
        onClose={handleCloseEnhanceModal}
        fullScreen
        sx={{
          '& .MuiDialog-container': { justifyContent: 'flex-end', alignItems: 'stretch' },
          '& .MuiBackdrop-root': { backgroundColor: 'rgba(0,0,0,0.35)' },
          '& .MuiPaper-root': {
            margin: 0, height: '100%', maxHeight: '100%',
            width: { xs: '95%', sm: '80%', md: '50vw', lg: '50vw' },
            maxWidth: '50vw',
            borderRadius: '16px 0 0 16px', overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#1976d2' }} />
            <Typography variant="h6" fontWeight={600}>Enhance listing</Typography>
          </Box>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, mb: 1,
            p: 1.5, bgcolor: '#f8f9fa', borderRadius: 1, border: '1px solid #e9ecef'
          }}>
            <Typography variant="body2">
              Shop: <strong>{formValues?.newShopName}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">4 field(s)</Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          {/* Accept All + Hide AI */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, height: 40 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptAll}
                  onChange={(e) => handleAcceptAll(e.target.checked)}
                  sx={{ color: '#1976d2', '&.Mui-checked': { color: '#1976d2' } }}
                />
              }
              label={
                <Typography variant="body2" fontWeight={500}>
                  Accept all ({enhanceFields.length})
                </Typography>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="textSecondary">Hide AI</Typography>
              <Switch
                checked={hideAI}
                onChange={(e) => setHideAI(e.target.checked)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#1976d2' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#1976d2' }
                }}
              />
            </Box>
          </Box>

          {/* Fields */}
          {enhanceFields.map((field) => (
            <Box
              key={field.id}
              sx={{
                border: '1px solid',
                borderColor: field.accepted ? '#1976d2' : '#e0e0e0',
                borderRadius: 2, p: 2, mb: 2,
                transition: 'all 0.2s ease',
                backgroundColor: field.accepted ? '#eff6ff' : 'white'
              }}
            >
              <Grid container spacing={2} alignItems="flex-start">
                {/* Original Side */}
                <Grid item xs={hideAI ? 12 : 6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, height: 40 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={field.accepted}
                        onChange={(e) => handleFieldAccept(field.id, e.target.checked)}
                        size="small"
                        sx={{ color: '#3544c5', '&.Mui-checked': { color: '#3544c5' }, p: 0.5 }}
                      />
                      <Typography variant="subtitle1" fontWeight={700}>{field.label}</Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">Original text</Typography>
                  </Box>
                  <TextField
                    fullWidth multiline minRows={2} maxRows={6} size="small"
                    value={field.original}
                    onChange={(e) => setEnhanceFields(prev =>
                      prev.map(f => f.id === field.id ? { ...f, original: e.target.value } : f)
                    )}
                    sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#f5f5f5' } }}
                  />
                </Grid>

                {/* AI Side */}
                {!hideAI && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 0.5, height: 40 }}>
                      <Typography variant="caption" color="textSecondary">AI generated text</Typography>
                    </Box>
                    <TextField
                      fullWidth multiline minRows={2} maxRows={6} size="small"
                      value={field.generated}
                      onChange={(e) => handleGeneratedChange(field.id, e.target.value)}
                      placeholder="AI content will appear here..."
                      sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fffde7' } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<AutoAwesomeIcon fontSize="small" />}>
                        Regenerate
                      </Button>
                      <IconButton size="small"><ThumbUpOutlinedIcon fontSize="small" /></IconButton>
                      <IconButton size="small"><ThumbDownOutlinedIcon fontSize="small" /></IconButton>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          ))}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={handleCloseEnhanceModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddToForm}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#074079' },
              minWidth: 120
            }}
          >
            Add to form
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Info;
