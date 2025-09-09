import * as React from "react";
import { useState } from "react";
import { Box, Checkbox, TextField } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import DataCustomisation from "./DataCustomisation";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

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

const TextCustomisation = ({ customizationData, setCustomizationData, index, myMyRef }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const [textFormTitle, settextFormTitle] = useState("");
  const [openTitleModal, setOpenTitleModal] = React.useState(false);
  const handleClose = () => setOpen(false);

  const changeDropDownTitleHandler = () => {
    setCustomizationData((prev) => {
      const updatedTextForm = prev.customizations.map((item, idx) =>
        idx === index ? { ...item, title: textFormTitle } : item
      );
      return {
        ...prev,
        customizations: updatedTextForm,
      };
    });
    setOpenTitleModal(false);
  };

  const handleTextFormChange = (e) => {
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
  const TextCustomizationDeleteHandler = (id) => {
    setCustomizationData((prv) => ({
      ...prv,
      customizations: prv.customizations.filter((item, i) => { return i !== id; })
    }))
  };
  // console.log({ textForm,index,customizationData,setCustomizationData });
  return (
    <>
      <Box>
        <Box>
          <div>
            <Accordion defaultExpanded>
              <Box
                sx={{
                  height: "40px"
                }}
                display={"flex"}
              >
                <Box
                  ref={myMyRef}
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
                      <Box onClick={() => setOpenTitleModal(true)} sx={{ cursor: "pointer" }}>
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
                      {customizationData.customizations[index].title}
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
                      <Button onClick={() => TextCustomizationDeleteHandler(index)}>
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
                        settextFormTitle(e.target.value);
                      }}
                      value={textFormTitle}
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
              </Box>

              <AccordionDetails>
                <Box>
                  <Box
                    sx={{
                      fontSize: "16px",
                      fontWeight: "600"
                    }}
                  >
                    Text Input
                  </Box>
                  <Box
                    sx={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "gray"
                    }}
                  >
                    Define the text Input Specifications
                  </Box>
                  {/* <Box
                    sx={{
                      fontSize: "16px",
                      fontWeight: "600",
                      marginTop: "10px"
                    }}
                  >
                    Fonts
                  </Box>
                  <Box
                    sx={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "gray"
                    }}
                  >
                    Select the fonts your buyers can Choose from
                  </Box> */}
                  <Box
                    sx={{
                      display: "flex",
                      marginTop: "20px",
                      justifyContent: "space-between"
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%"
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <Box
                          sx={{
                            width: "45%"
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
                          <Box
                            sx={{
                              width: "100%",
                              maxWidth: "100%"
                            }}
                          >
                            <TextField fullWidth label="Surface 1" id="fullWidth" name="label" value={customizationData.customizations[index].label} onChange={handleTextFormChange} />
                            {`You Have ${100 - customizationData?.customizations[index]?.label?.length} of 100 characters remaining`}
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            width: "45%"
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
                            Placeholder :
                          </Box>
                          <Box
                            sx={{
                              width: "100%",
                              maxWidth: "100%"
                            }}
                          >
                            <TextField fullWidth label="Surface 1" id="fullWidth" name="placeholder" value={customizationData.customizations[index].placeholder} onChange={handleTextFormChange} />
                            {`You Have ${100 - customizationData?.customizations[index]?.placeholder?.length} of 100 characters remaining`}
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
                              label="Surface 1"
                              id="fullWidth"
                              multiline
                              sx={{
                                width: "100%"
                              }}
                              name="instructions"
                              value={customizationData.customizations[index].instructions}
                              onChange={handleTextFormChange}
                            />
                            {`You Have ${200 - customizationData?.customizations[index]?.instructions?.length} of 200 characters remaining`}
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
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      marginTop: "20px",
                      justifyContent: "space-between"
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
                        Price:
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                          maxWidth: "100%"
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Price"
                          id="fullWidth"
                          name="price"
                          value={customizationData.customizations[index].price}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*\.?\d*$/.test(value)) { 
                              handleTextFormChange(e); 
                            }
                          }}
                        />
                      </Box>
                    </Box>
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
                        Character Minimum Limit:
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                          maxWidth: "100%"
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Min"
                          id="fullWidth"
                          name="min"
                          value={customizationData.customizations[index].min}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*\.?\d*$/.test(value)) { 
                              handleTextFormChange(e); 
                            }
                          }}
                        />
                      </Box>
                    </Box>
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
                        Character Maximum Limit:
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                          maxWidth: "100%"
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Max"
                          id="fullWidth"
                          name="max"
                          value={customizationData.customizations[index].max}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*\.?\d*$/.test(value)) { 
                              handleTextFormChange(e); 
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  {/* <Box
                    sx={{
                      marginTop: "20px"
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: "16px",
                        fontWeight: "600",
                        marginTop: "10px"
                      }}
                    >
                      Fonts Added
                    </Box>
                    <Box
                      sx={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "gray"
                      }}
                    >
                      The First option is Selected by default for the customers.
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        marginTop: "10px",
                        gap: "10px"
                      }}
                    >
                      <Box
                        sx={{
                          width: "40%",
                          border: "1px solid gray",
                          height: "100px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          overflowY: "auto",
                          padding: "10px"
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between"
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "20px"
                            }}
                          >
                            <Box
                              sx={{
                                height: "14px",
                                width: "14px",
                                backgroundColor: "darkblue",
                                borderRadius: "100%"
                              }}
                            ></Box>
                            <Box
                              sx={{
                                fontSize: "14px",
                                fontWeight: "500"
                              }}
                            >
                              Lato
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
                                backgroundColor: "darkblue",
                                color: "white",
                                fontSize: "12px",
                                borderRadius: "20px",
                                padding: "5px 8px"
                              }}
                            >
                              Default
                            </Box>
                            <Box>
                              <CloseIcon
                                sx={{
                                  height: "16px"
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Box>
                        <Button
                          variant="contained"
                          size="medium"
                          sx={{
                            paddingInline: "30px",
                            backgroundColor: "#1976d2"
                          }}
                        >
                          Add Fonts
                        </Button>
                      </Box>
                      <Box>
                        <Box>
                          <Button size="small">Apply Fonts to all text Customisations</Button>
                        </Box>
                        <Box>
                          <Button size="small">Apply Fonts to all text Customisations</Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box> */}
                  {/* <DataCustomisation /> */}
                </Box>
              </AccordionDetails>
            </Accordion>
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
            <Box></Box>
          </div>
        </Box>
      </Box>
    </>
  );
};

export default TextCustomisation;
