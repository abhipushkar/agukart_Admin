import React from "react";
import ParentProductIdentity from "./ParentProductIdentity";
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    Typography
} from "@mui/material";

import AppsIcon from "@mui/icons-material/Apps";
import { useSearchParams } from "react-router-dom";

// Error Boundary Component
class ProductErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Product Component Error:', error, errorInfo);

        // Log specific React reconciliation errors
        if (error.message.includes('key') || error.message.includes('children')) {
            console.error('React reconciliation issue detected');
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container>
                    <Box sx={{ py: "16px", marginTop: "30px" }} component={Paper}>
                        <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
                            <Box>
                                <AppsIcon />
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>
                                    Error Loading Product
                                </Typography>
                            </Box>
                        </Stack>
                        <Box
                            component={Paper}
                            sx={{
                                padding: "24px",
                                textAlign: "center"
                            }}
                        >
                            <Typography variant="h6" color="error" gutterBottom>
                                Something went wrong
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                {this.state.error?.message || 'An error occurred while loading the product.'}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={this.handleRetry}
                                sx={{ mt: 2 }}
                            >
                                Retry
                            </Button>
                        </Box>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

const ParentProducts = () => {
    const [query, setQuery] = useSearchParams();
    const queryId = query.get("id");
    const listing = query.get("listing");

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
                    <Box
                        component={Paper}
                        sx={{
                            padding: "24px"
                        }}
                    >
                        {/* Wrap with Error Boundary */}
                        <ProductErrorBoundary>
                            <ParentProductIdentity productId={queryId} listing={listing} />
                        </ProductErrorBoundary>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default ParentProducts;
