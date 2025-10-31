// components/CustomizationSurface.jsx
import React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    TextField,
    Button,
    Typography, Checkbox, FormControlLabel
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import CustomizationList from './CustomizationList';
import AddCustomizationModal from './AddCustomizationModal';
import {useProductFormStore} from "../../../../../states/useAddProducts";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1
});

const CustomizationSurface = () => {
    const { customizationData, setCustomizationData } = useProductFormStore();

    const handleSurfaceChange = (field, value) => {
        setCustomizationData({
            ...customizationData,
            [field]: value
        });
    };

    const handleBoxChange = (checked) => {
        setCustomizationData({
            ...customizationData,
            isExpanded: checked
        })
    }

    return (
        <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ fontSize: "24px", fontWeight: "700", borderRight: "1px solid black", paddingRight: "10px" }}>
                            1
                        </Box>
                        <Box sx={{ marginLeft: "10px" }}>
                            <CreateIcon sx={{ color: "gray" }} />
                        </Box>
                        <Box sx={{ fontWeight: "700", marginLeft: "10px" }}>
                            Surface 1
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ fontSize: "15px", fontWeight: "600", paddingInline: "10px" }}>
                            Change Order
                        </Box>
                        <Box sx={{ borderLeft: "1px solid black", borderRight: "1px solid black", paddingInline: "10px" }}>
                            <DeleteIcon />
                        </Box>
                    </Box>
                </Box>
            </AccordionSummary>

            <AccordionDetails>
                <Box>
                    <Box sx={{ fontSize: "16px", fontWeight: "600" }}>
                        Preview Image
                    </Box>
                    <Box sx={{ fontSize: "13px", fontWeight: "600", color: "gray" }}>
                        Add a preview image for this surface
                    </Box>

                    <Box sx={{ display: "flex", marginTop: "20px", justifyContent: "space-between" }}>
                        <Box sx={{ width: "30%" }}>
                            <Box>
                                <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap", width: "15%" }}>
                                    Label :
                                </Box>
                                <Box sx={{ width: "100%", maxWidth: "100%" }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Surface 1"
                                        name="label"
                                        value={customizationData?.label || ""}
                                        onChange={(e) => handleSurfaceChange('label', e.target.value)}
                                    />
                                    {`You Have ${100 - (customizationData?.label?.length || 0)} of 100 characters remaining`}
                                </Box>
                            </Box>

                            <Box sx={{ marginTop: "20px" }}>
                                <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap", width: "15%" }}>
                                    Instructions(Optional) :
                                </Box>
                                <Box sx={{ width: "100%", maxWidth: "100%" }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Surface 1"
                                        multiline
                                        rows={3}
                                        name="instructions"
                                        value={customizationData?.instructions || ""}
                                        onChange={(e) => handleSurfaceChange('instructions', e.target.value)}
                                    />
                                    {`You Have ${200 - (customizationData?.instructions?.length || 0)} of 200 characters remaining`}
                                </Box>
                            </Box>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={customizationData?.isExpanded}
                                        onChange={(e) => handleBoxChange(e.target.checked)}
                                    />
                                }
                                label="Want to show this customization Expanded?"
                                sx={{
                                    my: 2
                                }}
                            />
                        </Box>

                        <Box sx={{ width: "30%" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: "600" }}>
                                Preview Image*
                            </Box>
                            <Button
                                component="label"
                                variant="contained"
                                startIcon={<CloudUploadIcon sx={{ fontSize: "40px" }} />}
                                sx={{
                                    marginTop: "20px",
                                    backgroundColor: "transparent",
                                    border: "1px solid gray",
                                    boxShadow: "none",
                                    color: "black",
                                    flexDirection: "column",
                                    gap: "10px",
                                    transition: "all .3s easeInOut",
                                    "&:hover": { color: "white" }
                                }}
                            >
                                <>
                                    `Drag Or upload a Square Image`
                                    <Box>Min: 400*400</Box>
                                    <Box>JPEG Or PNG</Box>
                                    <Box>Max Size: 12MB</Box>
                                </>
                                <VisuallyHiddenInput type="file" />
                            </Button>
                        </Box>

                        <Box sx={{ width: "30%" }}>
                            <Box sx={{ fontSize: "14px", fontWeight: "600" }}>
                                Clipping Mask*
                            </Box>
                            <Button
                                component="label"
                                variant="contained"
                                sx={{
                                    marginTop: "20px",
                                    backgroundColor: "transparent",
                                    border: "1px solid gray",
                                    boxShadow: "none",
                                    color: "black",
                                    padding: "10px",
                                    flexDirection: "column",
                                    gap: "10px",
                                    fontSize: "12px",
                                    "&:hover": { color: "white" }
                                }}
                            >
                                Clipping masks allow you to define areas of your preview that should not
                                be covered by buyer uploaded images. For example, if you sell a onone case
                                and vou masked coin thei background and camera hole, a buyer uploaded
                                image would appear as if it was pertectly cut in the shape of the case,
                                leaving the background and Camera nole intacu
                                <Box sx={{
                                    border: "1px solid gray",
                                    padding: "5px",
                                    borderRadius: "8px",
                                    backgroundColor: "#1976d2",
                                    color: "white",
                                    fontWeight: "600"
                                }}>
                                    Upload mask
                                </Box>
                                <VisuallyHiddenInput type="file" />
                            </Button>
                        </Box>
                    </Box>

                    <CustomizationList />

                    <Box sx={{ marginTop: "20px" }}>
                        <Box sx={{ fontSize: "14px", fontWeight: "700", wordBreak: "normal", textWrap: "nowrap", width: "15%" }}>
                            Instructions(Optional) :
                        </Box>
                        <Box sx={{ width: "100%", maxWidth: "100%", border: "1px dotted gray", padding: "20px", height: "150px",
                            display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <AddCustomizationModal />
                        </Box>
                    </Box>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default CustomizationSurface;
