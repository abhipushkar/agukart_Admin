import React from "react";
import ParentProductIdentity from "./components/ParentProductIdentityNew";
import {
    Box,
    Container,
    Paper,
    Stack,
    Typography
} from "@mui/material";

import AppsIcon from "@mui/icons-material/Apps";
import {   useSearchParams } from "react-router-dom";

const ParentProductsNew = () => {
    const [query, setQuery] = useSearchParams();
    const queryId = query.get("id");

    return (
        <>
            <Container>
                <Box sx={{ py: "16px", marginTop: "30px" }} component={Paper}>
                    <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                        <Box>
                            <AppsIcon />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>
                                Add Parent Product
                            </Typography>
                        </Box>
                    </Stack>
                    {/* <Divider /> */}
                    <Box
                        component={Paper}
                        sx={{
                            padding: "24px"
                        }}
                    >
                        <ParentProductIdentity productId={queryId}/>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default ParentProductsNew;
