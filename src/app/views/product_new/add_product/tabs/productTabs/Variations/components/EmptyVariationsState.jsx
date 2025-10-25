import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const EmptyVariationsState = ({ onAddVariation }) => {
    return (
        <Box
            sx={{
                textAlign: "center",
                py: 6,
                border: "2px dashed #e0e0e0",
                borderRadius: 2,
                backgroundColor: "#fafafa"
            }}
        >
            <Typography variant="h6" color="textSecondary" gutterBottom>
                No variations added yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Add variations to offer your product in different colors, sizes, materials, etc.
            </Typography>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddVariation}
                sx={{ minWidth: '200px' }}
            >
                Add Your First Variation
            </Button>
        </Box>
    );
};

export default EmptyVariationsState;
