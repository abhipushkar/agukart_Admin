// ProductCustomizations.jsx
import React from 'react';
import { Box } from "@mui/material";
import CustomizationSurface from "./components/CustomizationSurface";

export default function ProductCustomizations() {
    return (
        <Box>
            <Box sx={{ fontSize: "35px", fontWeight: "500" }}>
                Edit Customisations
            </Box>
            <Box sx={{ fontSize: "20px", fontWeight: "500" }}>
                Manage your surfaces and customizations
            </Box>
            <Box sx={{ mb: 2 }}>
                A product can have up to five surfaces with ten customizations each
            </Box>

            <CustomizationSurface />
        </Box>
    );
}
