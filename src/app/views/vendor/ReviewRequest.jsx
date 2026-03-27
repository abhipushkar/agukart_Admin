import { Box, Button, CircularProgress, Typography, Alert } from "@mui/material";
import React from "react";
import QuillDes from "app/components/ReactQuillTextEditor/ReactQuillTextEditor/QuilDes";
// import TextEditor from "app/components/TextEditor/TextEditor";
import TextField from "@mui/material/TextField";
import InfoIcon from '@mui/icons-material/Info'


const ReviewRequest = ({
    formValues,
    setFormValues,
    errors,
    setErrors,
    handleValidate,
    queryId,
    loading,
    handleVendorSave
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prv) => ({ ...prv, [name]: "" }));
    };

    return (
        <>
            <h2>Product Review Request</h2>
            <Box>
                <Box width={"100%"}>
                    <Box
                        sx={{
                            height: "auto", // Set your desired height
                            width: "100%"
                        }}
                    >
                        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
                            <Typography variant="body2" fontWeight={500}>
                                Note:- This text will be sent in a message from Vendor to the buyer on requesting a Product Review !
                            </Typography>
                            <Typography variant="body2">
                                Make sure This message is convincing.
                            </Typography>
                        </Alert>
                        {/* <TextEditor name="reviewRequest" value={formValues?.reviewRequest} setFormValues={setFormValues} /> */}
                        <TextField
                            id="outlined-multiline"
                            multiline
                            rows={4}
                            variant="outlined"
                            fullWidth
                            name="reviewRequest"
                            value={formValues?.reviewRequest}
                            setFormValues={setFormValues}
                            onChange={handleChange}
                        />
                    </Box>
                    {errors.reviewRequest && (
                        <Typography
                            sx={{
                                fontSize: "12px",
                                color: "#FF3D57",
                                marginLeft: "14px",
                                marginRight: "14px",
                                marginTop: "3px"
                            }}
                        >
                            {errors.reviewRequest}
                        </Typography>
                    )}
                </Box>
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
                    {/* <Button
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
                    </Button> */}
                </Typography>
            </Box>
        </>
    );
};

export default ReviewRequest;
