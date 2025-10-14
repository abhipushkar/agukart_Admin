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

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CUSTOMIZATION_ITEM,
        item: { id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    });

    drag(drop(ref));

    return (
        <Box
            ref={ref}
            sx={{
                opacity: isDragging ? 0.5 : 1,
                cursor: "move"
            }}
        >
            <Accordion defaultExpanded={defaultExpanded}>
                <Box
                    sx={{
                        height: "40px"
                    }}
                    display={"flex"}
                >
                    <Box
                        ref={ref}
                        sx={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid black",
                            justifyContent: "space-between",
                            width: "100%"
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
                                    paddingInline: "10px"
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
                                    paddingInline: "10px"
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
