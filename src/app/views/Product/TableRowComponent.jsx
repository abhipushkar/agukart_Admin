import React, { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import {Box, Button, Checkbox, styled, Switch, Tooltip} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const TableRowComponent = ({
                               comb,
                               handleCombChange,
                               handleToggle,
                               combindex,
                               formValues,
                               variationsData,
                               combinationError,
                               showAll,
                               handleImageUpload,
                               handleImageRemove,
                               setShowAll
                           }) => {
    const label = { inputProps: { "aria-label": "Switch demo" } };

    const handleSeeMore = () => {
        setShowAll((prev) => !prev);
    };

    const itemsToShow = showAll ? comb.combinations : comb.combinations.slice(0, 5);

    const renderImageCell = (item, index, imageType, imageIndex = null) => {
        let imageValue;

        if (imageIndex !== null) {
            // Handle main_images array
            imageValue = item.main_images && item.main_images[imageIndex];
        } else {
            // Handle preview_image and thumbnail
            imageValue = item[imageType];
        }

        const isFile = imageValue instanceof File;
        const displayUrl = isFile ? URL.createObjectURL(imageValue) : imageValue;
        const imageKey = imageIndex !== null ? `main_images[${imageIndex}]` : imageType;

        return (
            <TableCell align="center">
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    {displayUrl ? (
                        <ImageTooltip
                            imageUrl={displayUrl}
                            onImageChange={(e) => handleImageUpload(combindex, index, imageKey, e)}
                            onImageRemove={() => handleImageRemove(combindex, index, imageKey)}
                        >
                            <Box
                                sx={{
                                    width: 69,
                                    height: 69,
                                    border: '1px dashed #ccc',
                                    p: 0.5,
                                    cursor: 'pointer'
                                }}
                            >
                                <img
                                    src={displayUrl}
                                    alt={`${imageKey} preview`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            </Box>
                        </ImageTooltip>
                    ) : (
                        <Button
                            component="label"
                            variant="outlined"
                            size="small"
                            sx={{mb: 1, aspectRatio: "1/1", width: "30px"}}
                        >
                            <AddPhotoAlternateIcon/>
                            <VisuallyHiddenInput
                                type="file"
                                onChange={(e) => handleImageUpload(combindex, index, imageKey, e)}
                                accept="image/*"
                            />
                        </Button>
                    )}
                </Box>
            </TableCell>
        );
    };

    return (
        <>
            {itemsToShow?.map((item, index) => (
                <TableRow
                    key={index}
                    sx={{
                        wordBreak: "keep-all"
                    }}
                >
                    <TableCell align="center">
                        <Checkbox {...label} size="small" />
                    </TableCell>
                    {item?.name1 && <TableCell align="center">{item?.name1}</TableCell>}
                    {item?.name2 && <TableCell align="center">{item?.name2}</TableCell>}

                    {/* Main Images */}
                    {renderImageCell(item, index, "main_images", 0)}
                    {renderImageCell(item, index, "main_images", 1)}
                    {renderImageCell(item, index, "main_images", 2)}

                    {/* Preview Image */}
                    {renderImageCell(item, index, "preview_image")}

                    {/* Thumbnail */}
                    {renderImageCell(item, index, "thumbnail")}

                    {(variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true) &&
                        item?.isCheckedPrice &&
                        item?.isVisible && (
                            <TableCell align="center">
                                <input
                                    type="text"
                                    name="price"
                                    value={item?.price || ""}
                                    onChange={(e) => handleCombChange(e, combindex, index)}
                                    style={{
                                        height: "30px",
                                        width: "100px",
                                        border: "2px solid green"
                                    }}
                                />
                                {combinationError[`Price-${comb.variant_name}-${index}`] && (
                                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                        {combinationError[`Price-${comb.variant_name}-${index}`]}
                                    </div>
                                )}
                            </TableCell>
                        )}

                    {(variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) &&
                        item?.isCheckedQuantity &&
                        item?.isVisible && (
                            <TableCell align="center">
                                <input
                                    type="text"
                                    name="qty"
                                    value={item?.qty || ""}
                                    onChange={(e) => handleCombChange(e, combindex, index)}
                                    style={{
                                        height: "30px",
                                        width: "100px",
                                        border: "2px solid green"
                                    }}
                                />
                                {combinationError[`Quantity-${comb.variant_name}-${index}`] && (
                                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                        {combinationError[`Quantity-${comb.variant_name}-${index}`]}
                                    </div>
                                )}
                            </TableCell>
                        )}

                    <TableCell align="center">
                        <Switch
                            {...label}
                            checked={item.isVisible}
                            onChange={() => handleToggle(combindex, index)}
                        />
                    </TableCell>
                </TableRow>
            ))}

            {comb.combinations.length > 5 && (
                <TableRow>
                    <TableCell colSpan={10} align="center">
                        <button
                            onClick={handleSeeMore}
                            style={{
                                padding: "5px 10px",
                                background: "lightblue",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: "4px"
                            }}
                        >
                            {showAll ? "See Less" : "See More"}
                        </button>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

const ImageTooltip = ({ imageUrl, onImageChange, onImageRemove, children }) => {
    const [open, setOpen] = useState(false);

    const handleTooltipOpen = () => {
        setOpen(true);
    };

    const handleTooltipClose = () => {
        setOpen(false);
    };

    return (
        <Tooltip
            open={open}
            onClose={handleTooltipClose}
            onOpen={handleTooltipOpen}
            title={
                <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                        src={imageUrl}
                        alt="Preview"
                        style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'contain',
                            marginBottom: '10px'
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {/*<Button*/}
                        {/*    variant="contained"*/}
                        {/*    size="small"*/}
                        {/*    component="label"*/}
                        {/*    sx={{ fontSize: '12px' }}*/}
                        {/*>*/}
                        {/*    Change*/}
                        {/*    <VisuallyHiddenInput*/}
                        {/*        type="file"*/}
                        {/*        onChange={onImageChange}*/}
                        {/*        accept="image/*"*/}
                        {/*    />*/}
                        {/*</Button>*/}
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={onImageRemove}
                            sx={{ fontSize: '12px' }}
                        >
                            Remove
                        </Button>
                    </Box>
                </Box>
            }
            arrow
            placement="top"
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: 'common.white',
                        color: 'common.black',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 1
                    }
                }
            }}
        >
            {children}
        </Tooltip>
    );
};

export default TableRowComponent;
