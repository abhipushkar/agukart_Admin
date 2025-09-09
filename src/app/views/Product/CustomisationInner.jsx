import * as React from "react";
import { Box, CircularProgress, Stack, TextField } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useState } from "react";
import TextCustomisation from "./edit-customisation/TextCustomisation";
import DataCustomisation from "./edit-customisation/DataCustomisation";
import OptionDropdown from "./edit-customisation/OptionDropdown";
import { use } from "echarts";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Paper } from "@mui/material";
import { set } from "lodash";
import { useLocation } from "react-router-dom";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1
});

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4
};

const ItemTypes = {
  BOX: "box"
};

const DraggableBox = ({
  id,
  index,
  i,
  moveBox,
  optionDropDownForm,
  addCustomizationHandler,
  customizationData,
  setCustomizationData
}) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.BOX,
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
    <Box>
      <OptionDropdown
        myMyRef={ref}
        key={i}
        index={i}
        addCustomizationHandler={addCustomizationHandler}
        optionDropDownForm={optionDropDownForm}
        customizationData={customizationData}
        setCustomizationData={setCustomizationData}
      />
    </Box>
  );
};
const DraggableBox2 = ({ id, index, i, moveBox, customizationData, setCustomizationData }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.BOX,
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
    <Box>
      <TextCustomisation
        myMyRef={ref}
        customizationData={customizationData}
        setCustomizationData={setCustomizationData}
        index={index}
      />
    </Box>
  );
};

const CustomisationInner = ({ customizationData, setCustomizationData,loading,draftLoading,EditProducthandler,handleDraftProduct }) => {
  // ["Text", "Data", "Option Dropdown", "Image", "Number"]
  const { state } = useLocation();
  const [open, setOpen] = React.useState(false);
  const [activeBox, setActiveBox] = React.useState("Text");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleBoxClick = (boxId) => {
    setActiveBox(boxId);
  };

  const addCustomizationHandler = () => {
    if (activeBox === "Text") {
      setCustomizationData((prev) => ({
        ...prev,
        customizations: [
          ...(prev?.customizations || []),
          {
            title: "text Customization",
            placeholder:"",
            label: "",
            instructions: "",
            price:"",
            min:"",
            max:"",
            isCompulsory: false
          }
        ]
      }));
    }
    if (activeBox === "Option Dropdown") {
      setCustomizationData((prev) => ({
        ...prev,
        customizations: [
          ...(prev?.customizations || []),
          {
            title: `Option Dropdown`,
            label: "",
            instructions: "",
            isCompulsory: false,
            optionList: [
              {
                optionName: "",
                priceDifference: ""
              }
            ]
          }
        ]
      }));
    }
    handleClose();
  };

  // console.log({ surface });
  // const addImageHandler = (e) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const imageFile = e.target.files[0];
  //     const imageUrl = URL.createObjectURL(imageFile);
  //     setSurFace((prv) => {
  //       let newArr = [...prv];
  //       newArr[0].previewImage = imageUrl;
  //       return newArr;
  //     });
  //   }
  // };

  const moveBox = (fromIndex, toIndex) => {
    const updatedForm = [...customizationData.optionDropDownForm];
    const [removed] = updatedForm.splice(fromIndex, 1);
    updatedForm.splice(toIndex, 0, removed);
    setCustomizationData((prev) => ({ ...prev, optionDropDownForm: updatedForm }));
  };
  const moveBox2 = (fromIndex, toIndex) => {
    const updatedForm = [...customizationData.customizations];
    const [removed] = updatedForm.splice(fromIndex, 1);
    updatedForm.splice(toIndex, 0, removed);
    setCustomizationData((prev) => ({
      ...prev,
      customizations: updatedForm,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "label" && value.length > 100) {
      return;
    }
    if (name === "instructions" && value.length > 200) {
      return;
    }
    setCustomizationData((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <>
      <Box>
        <Box
          sx={{
            fontSize: "35px",
            fontWeight: "500"
          }}
        >
          Edit Customisations
        </Box>
        <Box
          sx={{
            fontSize: "20px",
            fontWeight: "500"
          }}
        >
          Manage your surfaces and customizations
        </Box>
        <Box>A product can have up to five surfaces with ten customizations each</Box>
        <Box>
          <div>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid black",
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
                        paddingRight: "10px"
                      }}
                    >
                      1
                    </Box>
                    <Box
                      sx={{
                        marginLeft: "10px"
                      }}
                    >
                      <CreateIcon
                        sx={{
                          color: "gray"
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        fontWeight: "700",
                        marginLeft: "10px"
                      }}
                    >
                      Surface 1
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
                      <DeleteIcon />
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Box
                    sx={{
                      fontSize: "16px",
                      fontWeight: "600"
                    }}
                  >
                    Preview Image
                  </Box>
                  <Box
                    sx={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "gray"
                    }}
                  >
                    Add a preview image for this surface
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      marginTop: "20px",
                      justifyContent: "space-between"
                    }}
                  >
                    <Box
                      sx={{
                        width: "30%"
                      }}
                    >
                      <Box>
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
                        <Box
                          sx={{
                            width: "100%",
                            maxWidth: "100%"
                          }}
                        >
                          <TextField fullWidth placeholder="Surface 1" id="fullWidth" name="label" value={customizationData?.label} onChange={handleChange} />
                          {`You Have ${100 - customizationData?.label?.length
                            } of 100 characters remaining`}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          marginTop: "20px"
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
                          Instructions(Optional) :
                        </Box>
                        <Box
                          sx={{
                            width: "100%",
                            maxWidth: "100%"
                          }}
                        >
                          <TextField
                            fullWidth
                            placeholder="Surface 1"
                            id="fullWidth"
                            multiline
                            rows={3}
                            sx={{
                              width: "100%"
                            }}
                            name="instructions"
                            value={customizationData?.instructions}
                            onChange={handleChange}
                          />
                          {`You Have ${200 - customizationData?.instructions?.length
                            } of 200 characters remaining`}
                        </Box>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: "30%"
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: "14px",
                          fontWeight: "600"
                        }}
                      >
                        Preview Image*
                      </Box>
                      <Box>
                        <Button
                          component="label"
                          role={undefined}
                          variant="contained"
                          tabIndex={-1}
                          startIcon={
                            <CloudUploadIcon
                              sx={{
                                fontSize: "40px"
                              }}
                            />
                          }
                          sx={{
                            marginTop: "20px",
                            backgroundColor: "transparent",
                            border: "1px solid gray",
                            boxShadow: "none",
                            color: "black",
                            // display: "block",
                            flexDirection: "column",
                            gap: "10px",
                            transition: "all .3s easeInOut",
                            "&:hover": {
                              color: "white"
                            }
                          }}
                        >
                          <>
                            `Drag Or upload a Square Image`
                            <Box>Min: 400*400</Box>
                            <Box>JPEG Or PNG</Box>
                            <Box>Max Size: 12MB</Box>
                          </>
                          <VisuallyHiddenInput type="file" />
                        </Button>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: "30%"
                      }}
                    >
                      <Box
                        sx={{
                          fontSize: "14px",
                          fontWeight: "600"
                        }}
                      >
                        Clipping Mask*
                      </Box>
                      <Box>
                        <Button
                          component="label"
                          role={undefined}
                          variant="contained"
                          tabIndex={-1}
                          sx={{
                            marginTop: "20px",
                            backgroundColor: "transparent",
                            border: "1px solid gray",
                            boxShadow: "none",
                            color: "black",
                            padding: "10px",
                            flexDirection: "column",
                            gap: "10px",
                            fontSize: "12px",
                            "&:hover": {
                              color: "white"
                            }
                          }}
                        >
                          Clipping masks allow you to define areas of your preview that should not
                          be covered by buyer uploaded images. For example, if you sell a onone case
                          and vou masked coin thei background and camera hole, a buyer uploaded
                          image would appear as if it was pertectly cut in the shape of the case,
                          leaving the background and Camera nole intacu
                          <Box
                            sx={{
                              border: "1px solid gray",
                              padding: "5px",
                              borderRadius: "8px",
                              backgroundColor: "#1976d2",
                              color: "white",
                              fontWeight: "600"
                            }}
                          >
                            Upload mask
                          </Box>
                          <VisuallyHiddenInput type="file" />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                  <Stack gap={2} mt={2}>
                    <DndProvider backend={HTML5Backend}>
                      {customizationData?.customizations?.length > 0 &&
                        customizationData?.customizations?.map((item, i) => {
                          return (
                            <>
                              {
                                !item?.optionList ? (
                                  <DraggableBox2
                                    id={i}
                                    index={i}
                                    i={i}
                                    moveBox={moveBox2}
                                    customizationData={customizationData}
                                    setCustomizationData={setCustomizationData}
                                  />
                                ):(
                                  <DraggableBox
                                    key={i}
                                    id={i}
                                    index={i}
                                    i={i}
                                    moveBox={moveBox}
                                    addCustomizationHandler={addCustomizationHandler}
                                    optionDropDownForm={customizationData?.customizations[i]}
                                    customizationData={customizationData}
                                    setCustomizationData={setCustomizationData}
                                  />
                                )
                              }
                            </>
                          );
                        })}
                    </DndProvider>
                  </Stack>
                  <Box
                    sx={{
                      marginTop: "20px"
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
                      Instructions(Optional) :
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: "100%",
                        border: "1px dotted gray",
                        padding: "20px",
                        height: "150px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <div>
                        <Button
                          onClick={handleOpen}
                          sx={{
                            backgroundColor: "#1976d2",
                            color: "white",

                            "&:hover": {
                              backgroundColor: "blue"
                            }
                          }}
                        >
                          Add Customisation
                        </Button>
                        <Modal
                          open={open}
                          onClose={handleClose}
                          aria-labelledby="modal-modal-title"
                          aria-describedby="modal-modal-description"
                        >
                          <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2">
                              Add Customisation
                            </Typography>
                            <Typography
                              id="modal-modal-description"
                              sx={{
                                mt: 2,
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "10px"
                              }}
                            >
                              {["Text","Option Dropdown"].map(
                                (title, index) => (
                                  <Box
                                    key={index}
                                    className={activeBox === title ? "active" : ""}
                                    sx={{
                                      border:
                                        activeBox === title
                                          ? "2px solid #1976d2"
                                          : "2px solid #eee",
                                      width: "30%",
                                      height: "180px",
                                      cursor: "pointer", // Add cursor pointer to indicate clickability
                                      backgroundColor: activeBox === title ? "#fff" : "inherit" // Change background color when active
                                    }}
                                    onClick={() => handleBoxClick(title)}
                                  >
                                    <Box
                                      sx={{
                                        fontWeight: "500",
                                        padding: "8px",
                                        fontSize: "13px",
                                        borderBottom:
                                          title !== "Text"
                                            ? "1px solid gray"
                                            : title === "Text"
                                              ? "1px solid gray"
                                              : "1px solid gray",
                                        backgroundColor: activeBox === title ? "#1976d2" : "#fff",
                                        color: activeBox === title ? "#fff" : "#000"
                                      }}
                                    >
                                      {title}
                                    </Box>
                                    <Box
                                      sx={{
                                        padding: "5px"
                                      }}
                                    >
                                      {title === "Text" &&
                                        "Allow buyers to add their personalized text on your product. Ideal for names printed on a surface."}
                                      {title === "Data" &&
                                        "Allow buyers to provide input about your product that does not affect the image preview. Ideal for custom sizing or notes."}
                                      {title === "Option Dropdown" &&
                                        "Allow buyers to choose from different sets of options that you offer. Ideal for products with different variations."}
                                      {title === "Image" &&
                                        "Allow buyers to personalize your product by uploading their own image. Ideal for photos printed on a surface."}
                                      {title === "Number" &&
                                        "Allow buyers to enter a number. This can be used for length, quantity, etc."}
                                    </Box>
                                  </Box>
                                )
                              )}
                            </Typography>
                            <Box
                              sx={{
                                borderTop: "1px solid gray",
                                marginTop: "20px",
                                display: "flex",
                                justifyContent: "end"
                              }}
                            >
                              <Button
                                variant="contained"
                                sx={{
                                  marginTop: "20px",
                                  backgroundColor: "#1976d2"
                                }}
                                onClick={addCustomizationHandler}
                              >
                                Add Customisation
                              </Button>
                            </Box>
                          </Box>
                        </Modal>
                      </div>
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Box
              sx={{
                marginTop: "20px"
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
              ></Box>
            </Box>
            {/* <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginTop: "20px",
                gap: "10px"
              }}
            >
              <Button variant="outlined">Preview</Button>
              <Button variant="outlined">Generate Templates</Button>
            </Box> */}
           <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: "20px"
            }}
          >
            <Button
              endIcon={draftLoading ? <CircularProgress size={15} /> : ""}
              disabled={draftLoading}
              onClick={handleDraftProduct}
              variant="contained"
            >
              Save As Draft
            </Button>
            <Box
              sx={{
                display: "flex",
                gap: "5px"
              }}
            >
                <Button
                  endIcon={loading ? <CircularProgress size={15} /> : ""}
                  disabled={loading}
                  onClick={EditProducthandler}
                  variant="contained"
                >
                  Submit
                </Button>
            </Box>
          </Box>
          </div>
        </Box>
      </Box>
    </>
  );
};

export default CustomisationInner;
