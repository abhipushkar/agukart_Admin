import React from "react";
import {
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VariationTableRow from "./VariationTableRow";
import {useProductFormStore} from "../../../../../states/useAddProducts";

const VariationsTable = () => {
    const {
        combinations,
        variationsData,
        formValues,
        combinationError,
        showAll,
        setCombinationError,
        setShowAll,
        handleToggle,
        handleCombChange,
        handleImageUpload,
        handleImageRemove,
        handleEditImage,
        handleRowReorder
    } = useProductFormStore();

    const handleEdit = (comb) => {
        // This will be handled by the parent component through VariantModal
        console.log("Edit variation:", comb);
    };

    return (
        <Box>
            {combinations?.map((comb, combindex) => (
                <Box key={combindex} sx={{ mb: 4 }}>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                        p: 2,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1,
                        border: '1px solid #e9ecef'
                    }}>
                        <Box>
                            <Typography variant="h6" fontWeight={600} color="primary">
                                {comb.variant_name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {comb.combinations?.length || 0} variant(s)
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => handleEdit(comb)}
                            color="primary"
                            size="small"
                            sx={{
                                backgroundColor: 'white',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0'
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Variations Table */}
                    <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Drag
                                    </TableCell>
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Select
                                    </TableCell>
                                    {comb.combinations[0]?.name1 && (
                                        <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                            {comb.combinations[0]?.name1}
                                        </TableCell>
                                    )}
                                    {comb.combinations[0]?.name2 && (
                                        <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                            {comb.combinations[0]?.name2}
                                        </TableCell>
                                    )}
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Multiple Upload
                                    </TableCell>
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Main Image 1
                                    </TableCell>
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Main Image 2
                                    </TableCell>
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Main Image 3
                                    </TableCell>
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Preview
                                    </TableCell>
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Thumbnail
                                    </TableCell>
                                    {(variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) && formValues?.isCheckedPrice && (
                                        <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                            Price
                                        </TableCell>
                                    )}
                                    {(variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) && formValues?.isCheckedQuantity && (
                                        <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                            Quantity
                                        </TableCell>
                                    )}
                                    <TableCell align="center" sx={{ wordBreak: "keep-all", fontWeight: 600, py: 2 }}>
                                        Visible
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <VariationTableRow
                                    comb={comb}
                                    combindex={combindex}
                                    formValues={formValues}
                                    variationsData={variationsData}
                                    combinationError={combinationError}
                                    showAll={showAll}
                                    setCombinationError={setCombinationError}
                                    setShowAll={setShowAll}
                                    handleToggle={handleToggle}
                                    handleCombChange={handleCombChange}
                                    handleImageUpload={handleImageUpload}
                                    handleImageRemove={handleImageRemove}
                                    handleEditImage={handleEditImage}
                                    onRowReorder={handleRowReorder}
                                />
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ))}
        </Box>
    );
};

export default VariationsTable;
