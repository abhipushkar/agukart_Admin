import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateIcon from "@mui/icons-material/Create";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useState, useRef } from "react";
import { Box, Button, Checkbox, TableCell, tableCellClasses, TextField } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import styled from "@emotion/styled";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  BOX: "box"
};

const DraggableBox = ({
  id,
  index,
  moveBox,
  row,
  setCustomizationData,
  optionDropDownForm,
  i
}) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.BOX,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = i;

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

      moveBox(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.BOX,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  drag(drop(ref));

  return (
    <TableRow
      ref={ref}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        "&:last-child td, &:last-child th": { border: 0 }
      }}
    >
      <TableCell component="th" scope="row">
        <Box
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <FilterListIcon />
        </Box>
      </TableCell>
      <TableCell>
        <TextField
          name="optionName"
          value={optionDropDownForm?.optionList[i]?.optionName || ""}
          onChange={(e) => {
            setCustomizationData((prev) => ({
              ...prev,
              customizations: prev.customizations.map((item, idx) =>
                idx === index
                  ? {
                    ...item,
                    optionList: item?.optionList?.map((option, optIdx) =>
                      optIdx === i ? { ...option, optionName: e.target.value } : option
                    ),
                  }
                  : item
              ),
            }))
          }}
          id="outlined-basic"
          label="Value1"
          variant="outlined"
        />
      </TableCell>
      <TableCell>
        <Box
          sx={{
            border: "2px dotted #1976d2",
            height: "50px",
            width: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <AddAPhotoIcon
            sx={{
              color: "#1976d2"
            }}
          />
        </Box>
      </TableCell>
      <TableCell>
        <Box
          sx={{
            border: "2px dotted #1976d2",
            height: "50px",
            width: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <AddAPhotoIcon
            sx={{
              color: "#1976d2"
            }}
          />
        </Box>
      </TableCell>
      <TableCell>
        <TextField
          id="outlined-basic"
          label="$ +"
          variant="outlined"
          name="priceDifference"
          value={optionDropDownForm?.optionList[i]?.priceDifference || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value)) {
              setCustomizationData((prev) => ({
                ...prev,
                customizations: prev.customizations.map((item, idx) =>
                  idx === index
                    ? {
                      ...item,
                      optionList: item.optionList.map((option, optIdx) =>
                        optIdx === i ? { ...option, priceDifference: value } : option
                      ),
                    }
                    : item
                ),
              }));
            }
          }}
          inputProps={{
            inputMode: "numeric", 
            pattern: "[0-9]*", 
          }}
        />
      </TableCell>
      <TableCell>
        <Button
          onClick={() => {
            console.log({ i, index });
            const filterItem = optionDropDownForm.optionList.filter((item, index) => {
              return index !== i;
            });
            setCustomizationData((prev) => ({
              ...prev,
              customizations: prev.customizations.map((item, idx) =>
                idx === index ? { ...item, optionList: filterItem } : item
              ),
            }));
          }}
        >
          <DeleteIcon />
        </Button>
      </TableCell>
    </TableRow>
  );
};

function OptionDropdown({
  optionDropDownForm,
  customizationData,
  setCustomizationData,
  index,
  addCustomizationHandler,
  myMyRef
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [addManyOptions, setAddManyOptions] = useState([]);
  const [addManyDropDownOptions, setAddManyDropDownOptions] = useState([]);
  const [optionDropDownModal, setOptionDropDownMoadal] = useState(false);
  const [openTitleModal, setOpenTitleModal] = useState(false);
  const [optionDropDownTitle, setOptionDropDownTitle] = useState("");

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    // border: "2px solid #000",
    boxShadow: 24,
    p: 4
  };

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0
    }
  }));

  const addManyOptionHandler = () => {
    if (addManyOptions.length === 0) return;
    for (let i = 0; i < addManyOptions.length; i++) {
      let newArr = [...customizationData?.customizations];
      newArr[index].optionList.push({
        optionName: addManyOptions[i],
        priceDifference: ""
      });
    }
    handleClose();
  };

  const addManyDropDownOptionHandler = () => {
    if (addManyDropDownOptions.length === 0) return;
    for (let i = 0; i < addManyDropDownOptions.length; i++) {
      setCustomizationData((prv) => ({
        ...prv,
        customizations: [...prv.customizations, {
          title: addManyDropDownOptions[i],
          Label: "",
          Instructions: "",
          optionList: [
            {
              optionName: "",
              priceDifference: ""
            }
          ]
        }]
      }))
    }
    setOptionDropDownMoadal(false);
  };
  const optionDropDownDeleteHandler = (id) => {
    setCustomizationData((prv) => ({
      ...prv,
      customizations: prv.customizations.filter((item, i) => { return i !== id; })
    }))
  };
  const changeDropDownTitleHandler = () => {
    setCustomizationData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((item, idx) =>
        idx === index ? { ...item, title: optionDropDownTitle } : item
      )
    }));
    setOpenTitleModal(false);
  };

  const moveBox = (fromIndex, toIndex) => {
    console.log("is it working");
    const updatedBoxes = [...customizationData.customizations[index]?.optionList];
    const [movedBox] = updatedBoxes.splice(fromIndex, 1);
    updatedBoxes.splice(toIndex, 0, movedBox);
    console.log({ fromIndex, toIndex });
    setCustomizationData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((item, idx) =>
        idx === index ? { ...item, optionList: [...updatedBoxes] } : item
      ),
    }));
  };

  const handleOptionDropDownFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "label" && value.length > 100) {
      return;
    }

    if (name === "instructions" && value.length > 200) {
      return;
    }
    setCustomizationData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((item, idx) =>
        idx === index ? { ...item, [name]: value } : item
      ),
    }));
  }

  const handleCheckboxChange = (index, checked) => {
    setCustomizationData((prev) => ({
      ...prev,
      customizations: prev.customizations.map((item, idx) =>
        idx === index ? { ...item, isCompulsory: checked } : item
      ),
    }))
  }

  return (
    <>
      <Accordion defaultExpanded>
        <Box
          sx={{
            height: "40px"
          }}
          display={"flex"}
        >
          {/*<Box*/}
          {/*  ref={myMyRef}*/}
          {/*  sx={{*/}
          {/*    cursor: "pointer",*/}
          {/*    display: "flex",*/}
          {/*    alignItems: "center",*/}
          {/*    border: "1px solid black",*/}
          {/*    justifyContent: "space-between",*/}
          {/*    width: "100%"*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <Box*/}
          {/*    sx={{*/}
          {/*      display: "flex",*/}
          {/*      alignItems: "center"*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Box*/}
          {/*      sx={{*/}
          {/*        fontSize: "24px",*/}
          {/*        fontWeight: "700",*/}
          {/*        borderRight: "1px solid black",*/}
          {/*        paddingInline: "10px"*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      {index + 1}*/}
          {/*    </Box>*/}
          {/*    <Box*/}
          {/*      sx={{*/}
          {/*        marginLeft: "10px"*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      <Box onClick={() => setOpenTitleModal(true)} sx={{ cursor: "pointer" }}>*/}
          {/*        <CreateIcon*/}
          {/*          sx={{*/}
          {/*            color: "black"*/}
          {/*          }}*/}
          {/*        />*/}
          {/*      </Box>*/}
          {/*    </Box>*/}
          {/*    <Box*/}
          {/*      sx={{*/}
          {/*        fontWeight: "700",*/}
          {/*        marginLeft: "10px"*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      {optionDropDownForm?.title}*/}
          {/*    </Box>*/}
          {/*  </Box>*/}
          {/*  <Box*/}
          {/*    sx={{*/}
          {/*      display: "flex",*/}
          {/*      alignItems: "center"*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Box*/}
          {/*      sx={{*/}
          {/*        fontSize: "15px",*/}
          {/*        fontWeight: "600",*/}
          {/*        paddingInline: "10px"*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      Change Order*/}
          {/*    </Box>*/}
          {/*    <Box*/}
          {/*      sx={{*/}
          {/*        borderLeft: "1px solid black",*/}
          {/*        borderRight: "1px solid black",*/}
          {/*        paddingInline: "10px"*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      <Button onClick={() => optionDropDownDeleteHandler(index)}>*/}
          {/*        <DeleteIcon sx={{ color: "black" }} />*/}
          {/*      </Button>*/}
          {/*    </Box>*/}
          {/*  </Box>*/}
          {/*</Box>*/}
          {/*<AccordionSummary*/}
          {/*  expandIcon={<ExpandMoreIcon />}*/}
          {/*  aria-controls="panel3-content"*/}
          {/*  id="panel3-header"*/}
          {/*></AccordionSummary>*/}
        </Box>
        <Modal
          open={openTitleModal}
          onClose={() => setOpenTitleModal(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography variant="h6">Change Title</Typography>
            <TextField
              multiline
              onChange={(e) => {
                setOptionDropDownTitle(e.target.value);
              }}
              value={optionDropDownTitle}
              rows={3}
              sx={{
                width: "100%"
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <Button variant="contained" onClick={changeDropDownTitleHandler}>
                Add
              </Button>
            </Box>
          </Box>
        </Modal>
        <AccordionDetails>
          <div>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <Box
                sx={{
                  width: "48%"
                  // bgcolor: "red"
                }}
              >
                <Box
                  sx={{
                    fontSize: "14px",
                    fontWeight: "700",
                    wordBreak: "normal",
                    textWrap: "nowrap",
                    width: "15%"
                  }}
                >
                  Label :
                </Box>
                <TextField
                  id="outlined-basic"
                  fullWidth
                  placeholder="Label"
                  variant="outlined"
                  name="label"
                  value={optionDropDownForm.label}
                  onChange={handleOptionDropDownFormChange}
                />
                {`You Have ${100 - optionDropDownForm.label.length} of 100 characters remaining`}
              </Box>
              <Box
                sx={{
                  width: "48%"
                  // bgcolor: "red"
                }}
              >
                <Box
                  sx={{
                    fontSize: "14px",
                    fontWeight: "700",
                    wordBreak: "normal",
                    textWrap: "nowrap",
                    width: "15%"
                  }}
                >
                  Instructions: (Optional)
                </Box>
                <TextField
                  id="outlined-basic"
                  fullWidth
                  placeholder="instructions"
                  variant="outlined"
                  name="instructions"
                  value={optionDropDownForm.instructions}
                  onChange={handleOptionDropDownFormChange}
                />
                {`You Have ${200 - optionDropDownForm.instructions.length
                  } of 200 characters remaining`}
              </Box>
            </Box>
            <Box
              sx={{
                width: "50%"
              }}
            >
              <Box
                sx={{
                  fontSize: "14px",
                  fontWeight: "700",
                  wordBreak: "normal",
                  textWrap: "nowrap"
                }}
              >
                Compulsory :
              </Box>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "100%"
                }}
              >
                <Checkbox
                  checked={customizationData?.customizations[index]?.isCompulsory || false}
                  onChange={(e) => {
                    handleCheckboxChange(index, e.target.checked)
                  }
                  }
                  name="isCompulsory"
                  color="primary"
                />
              </Box>
            </Box>
            {/* <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "8px"
              }}
            >
              <Button
                onClick={() => setOptionDropDownMoadal(true)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      color: "#1976d2"
                    }}
                  >
                    <AddToPhotosIcon />
                  </Box>
                  <Box
                    sx={{
                      fontSize: "12px",
                      color: "#1976d2",
                      fontWeight: "600"
                    }}
                  >
                    Add Many Options
                  </Box>
                </Box>
              </Button>

              <Modal
                open={optionDropDownModal}
                onClose={() => setOptionDropDownMoadal(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                    sx={{
                      borderBottom: "1px solid"
                    }}
                  >
                    Add Many Options
                  </Typography>
                  <Typography
                    id="modal-modal-description"
                    sx={{
                      mt: 2,
                      color: "#1976d2",
                      fontWeight: "600"
                    }}
                  >
                    Add Up to 100 options Seprated by Commas.
                  </Typography>
                  <Typography id="modal-modal-description" sx={{}}>
                    Example: Option 1, Option 2, Option 3
                  </Typography>
                  <Typography
                    id="modal-modal-description"
                    sx={{
                      marginTop: "10px"
                    }}
                  >
                    <TextField
                      multiline
                      onChange={(e) => {
                        setAddManyDropDownOptions(e.target.value.split(","));
                      }}
                      rows={3}
                      sx={{
                        width: "100%"
                      }}
                    />
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                    <Button variant="contained" onClick={addManyDropDownOptionHandler}>
                      Add
                    </Button>
                  </Box>
                </Box>
              </Modal>

              <Button
                onClick={() =>
                  setOptionDropDownForm((prev) => [
                    ...prev,
                    {
                      title: `Option Dropdown`,
                      Label: "",
                      Instructions: "",
                      optionList: [
                        {
                          optionName: "",
                          priceDifference: ""
                        }
                      ]
                    }
                  ])
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      color: "#1976d2"
                    }}
                  >
                    <AddToPhotosIcon />
                  </Box>
                  <Box
                    sx={{
                      fontSize: "12px",
                      color: "#1976d2",
                      fontWeight: "600"
                    }}
                  >
                    Add Options
                  </Box>
                </Box>
              </Button>
            </Box> */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "10px"
              }}
            >
              <Box
                sx={{
                  fontSize: "24px",
                  fontWeight: "700"
                }}
              >
                Option List
              </Box>
            </Box>

            <Box>
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Option Name</TableCell>
                      <TableCell>Thumbnail</TableCell>
                      <TableCell>Preview</TableCell>
                      <TableCell>Price Difference</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <DndProvider backend={HTML5Backend}>
                      {optionDropDownForm?.optionList?.map((row, i) => (
                        // <TableRow
                        //   key={row.name}
                        //   sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        // >
                        //   <TableCell component="th" scope="row">
                        //     <Box
                        //       sx={{
                        //         display: "flex",
                        //         alignItems: "center"
                        //       }}
                        //     >
                        //       <FilterListIcon />
                        //     </Box>
                        //   </TableCell>
                        //   <TableCell>
                        //     <TextField
                        //       // value={value}
                        //       // onChange={(e) => setValue(e.target.value)}
                        //       value={optionDropDownForm.optionList[i].optionName}
                        //       onChange={(e) => {
                        //         setOptionDropDownForm((prev) => {
                        //           let newArr = [...prev];
                        //           newArr[index].optionList[i].optionName = e.target.value;
                        //           return newArr;
                        //         });
                        //       }}
                        //       id="outlined-basic"
                        //       label="Value1"
                        //       variant="outlined"
                        //     />
                        //   </TableCell>
                        //   <TableCell>
                        //     <Box
                        //       sx={{
                        //         border: "2px dotted #1976d2",
                        //         height: "50px",
                        //         width: "50px",
                        //         display: "flex",
                        //         alignItems: "center",
                        //         justifyContent: "center"
                        //       }}
                        //     >
                        //       <AddAPhotoIcon
                        //         sx={{
                        //           color: "#1976d2"
                        //         }}
                        //       />
                        //     </Box>
                        //   </TableCell>
                        //   <TableCell>
                        //     <Box
                        //       sx={{
                        //         border: "2px dotted #1976d2",
                        //         height: "50px",
                        //         width: "50px",
                        //         display: "flex",
                        //         alignItems: "center",
                        //         justifyContent: "center"
                        //       }}
                        //     >
                        //       <AddAPhotoIcon
                        //         sx={{
                        //           color: "#1976d2"
                        //         }}
                        //       />
                        //     </Box>
                        //   </TableCell>
                        //   <TableCell>
                        //     <TextField id="outlined-basic" label="$ +" variant="outlined" />
                        //   </TableCell>
                        // </TableRow>

                        <DraggableBox
                          optionDropDownForm={optionDropDownForm}
                          setCustomizationData={setCustomizationData}
                          key={i}
                          i={i}
                          id={i}
                          index={index}
                          row={row}
                          moveBox={moveBox}
                        />
                      ))}
                    </DndProvider>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "end",
                marginTop: "20px"
              }}
            >
              <Box>
                <Button
                  onClick={handleOpen}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      color: "#1976d2"
                    }}
                  >
                    <AddToPhotosIcon />
                  </Box>
                  <Box
                    sx={{
                      fontSize: "12px",
                      color: "#1976d2",
                      fontWeight: "600"
                    }}
                  >
                    Add Many Options
                  </Box>
                </Button>
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={style}>
                    <Typography
                      id="modal-modal-title"
                      variant="h6"
                      component="h2"
                      sx={{
                        borderBottom: "1px solid"
                      }}
                    >
                      Add Many Options
                    </Typography>
                    <Typography
                      id="modal-modal-description"
                      sx={{
                        mt: 2,
                        color: "#1976d2",
                        fontWeight: "600"
                      }}
                    >
                      Add Up to 100 options Seprated by Commas.
                    </Typography>
                    <Typography id="modal-modal-description" sx={{}}>
                      Example: Option 1, Option 2, Option 3
                    </Typography>
                    <Typography
                      id="modal-modal-description"
                      sx={{
                        marginTop: "10px"
                      }}
                    >
                      <TextField
                        multiline
                        onChange={(e) => {
                          setAddManyOptions(e.target.value.split(","));
                        }}
                        rows={3}
                        sx={{
                          width: "100%"
                        }}
                      />
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
                      <Button variant="contained" onClick={addManyOptionHandler}>
                        Add
                      </Button>
                    </Box>
                  </Box>
                </Modal>
              </Box>
              <Button
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
                onClick={() => {
                  let newArr = [...customizationData?.customizations];
                  newArr[index].optionList.push({
                    optionName: "",
                    priceDifference: ""
                  });
                  setCustomizationData((prev) => ({ ...prev, customizations: newArr }));
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      color: "#1976d2"
                    }}
                  >
                    <AddToPhotosIcon />
                  </Box>
                  <Box
                    sx={{
                      fontSize: "12px",
                      color: "#1976d2",
                      fontWeight: "600"
                    }}
                  >
                    Add Options
                  </Box>
                </Box>
              </Button>
            </Box>
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default OptionDropdown;
