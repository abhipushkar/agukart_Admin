// DraggableCustomizationItem.jsx
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Box, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

const ItemTypes = {
    CUSTOMIZATION_ITEM: "customization_item"
};

const DraggableCustomizationItem = ({
                                        id,
                                        index,
                                        moveItem,
                                        children,
                                        title,
                                        onTitleEdit,
                                        onDelete,
                                        onMoveUp,
                                        onMoveDown,
                                        canMoveUp,
                                        canMoveDown,
                                        defaultExpanded = true
                                    }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
        accept: ItemTypes.CUSTOMIZATION_ITEM,
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) {
                return;
            }

            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;

            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            moveItem(dragIndex, hoverIndex);
            item.index = hoverIndex;
        }
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.CUSTOMIZATION_ITEM,
        item: { id, index, type: ItemTypes.CUSTOMIZATION_ITEM },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    // Use preview for the entire component but drag only for the handle
    drag(drop(ref));

    return (
        <Box
            ref={preview} // Use preview for the entire component
            sx={{
                opacity: isDragging ? 0.5 : 1,
                cursor: "move",
                // transform: isDragging ? 'rotate(5deg)' : 'none',
                transition: isDragging ? 'none' : 'all 0.2s ease',
                boxShadow: isDragging ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
                position: 'relative',
                zIndex: isDragging ? 1000 : 1,
            }}
        >
            <Accordion
                defaultExpanded={defaultExpanded}
                sx={{
                    pointerEvents: isDragging ? 'none' : 'auto',
                }}
            >
                <Box
                    sx={{
                        height: "40px"
                    }}
                    display={"flex"}
                >
                    <Box
                        ref={ref} // Drag handle reference
                        sx={{
                            cursor: isDragging ? 'grabbing' : 'grab',
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid black",
                            justifyContent: "space-between",
                            width: "100%",
                            userSelect: 'none',
                            touchAction: 'none',
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            <Box
                                sx={{
                                    fontSize: "24px",
                                    fontWeight: "700",
                                    borderRight: "1px solid black",
                                    paddingInline: "10px",
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                }}
                            >
                                {index + 1}
                            </Box>
                            <Box
                                sx={{
                                    marginLeft: "10px"
                                }}
                            >
                                <Box onClick={onTitleEdit} sx={{ cursor: "pointer" }}>
                                    <CreateIcon
                                        sx={{
                                            color: "black"
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    fontWeight: "700",
                                    marginLeft: "10px"
                                }}
                            >
                                {title}
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            <Box
                                sx={{
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    paddingInline: "10px",
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                }}
                            >
                                Change Order
                            </Box>
                            <Box
                                sx={{
                                    borderLeft: "1px solid black",
                                    borderRight: "1px solid black",
                                    paddingInline: "10px"
                                }}
                            >
                                <Button onClick={onDelete}>
                                    <DeleteIcon sx={{ color: "black" }} />
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        sx={{
                            cursor: isDragging ? 'grabbing' : 'pointer',
                        }}
                    ></AccordionSummary>
                </Box>
                <AccordionDetails>
                    {children}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default DraggableCustomizationItem;
