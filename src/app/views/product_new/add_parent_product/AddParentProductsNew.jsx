// components/ParentProduct/ParentProducts.jsx
import React from 'react';
import {
    Box,
    Container,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import { useSearchParams } from "react-router-dom";
import ParentProductIdentityNew from "./components/ParentProductIdentityNew";

const ParentProducts = () => {
    const [query] = useSearchParams();
    const queryId = query.get("id");

    console.log("I'm the new parent product add page");

    return (
        <Container>
            <Box sx={{ py: "16px", marginTop: "30px" }} component={Paper}>
                <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                    <AppsIcon />
                    <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>
                        {queryId ? "Edit Parent Product" : "Add Parent Product"}
                    </Typography>
                </Stack>
                <Box component={Paper} sx={{ padding: "24px" }}>
                    <ParentProductIdentityNew productId={queryId} />
                </Box>
            </Box>
        </Container>
    );
};

export default ParentProducts;
