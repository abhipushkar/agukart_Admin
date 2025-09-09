import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreateIcon from "@mui/icons-material/Create";
import { Accordion, Box, TextField } from "@material-ui/core";
import { WidthFull } from "@mui/icons-material";
import { AccordionDetails, Button, grid2Classes } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import ModeIcon from "@mui/icons-material/Mode";
import DeleteIcon from "@mui/icons-material/Delete";
import AccordionSummary from "@mui/material/AccordionSummary";
import OptionDropdown from "./OptionDropdown";

const DataCustomisation = () => {
  return (
    <div>
      <Box
        sx={{
          marginTop: "30px",
          borderBottom: "1px solid gray"
        }}
      >
        <Box
          sx={{
            paddingBottom: "8px"
          }}
        >
          2 of 30 fonts added
        </Box>
      </Box>
      <Box
        sx={{
          fontSize: "35px",
          paddingTop: "10px",
          fontWeight: "500"
        }}
      >
        COLOR
      </Box>
      <Box
        sx={{
          marginBottom: "4px"
        }}
      >
        Select the colors your buyers can choose from.
      </Box>
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
          <TextField id="outlined-basic" fullWidth label="Label" variant="outlined" sx={{}} />
          You Have 91 of 100 characters remaining
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
            label="Instructions"
            variant="outlined"
            sx={{}}
          />
          You Have 200 of 200 characters remaining
        </Box>
      </Box>
      <Box
        sx={{
          marginTop: "40px",
          fontSize: "28px",
          fontWeight: "500"
        }}
      >
        Colors added
      </Box>
      <Box
        sx={{
          marginTop: "6px",
          fontSize: "14px",
          fontWeight: "400"
        }}
      >
        The first option is selected by default for the customers.
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%"
        }}
      >
        <Box
          sx={{
            marginTop: "20px",
            width: "100%"
          }}
        >
          <Box
            sx={{
              fontSize: "16px",
              fontWeight: "600",
              marginTop: "10px",
              width: "100%"
            }}
          >
            Fonts Added
          </Box>
          <Box
            sx={{
              fontSize: "13px",
              fontWeight: "600",
              color: "gray",
              width: "100%"
            }}
          >
            The First option is Selected by default for the customers.
          </Box>
          <Box
            sx={{
              display: "flex",
              marginTop: "10px",
              alignItems: "start",
              gap: "20px",
              width: "100%"
            }}
          >
            <Box
              sx={{
                width: "40%",
                border: "1px solid gray",
                height: "100px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                // padding: "10px"
                gap: "5px"
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
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    width: "100%",
                    justifyContent: "space-between"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <FilterListIcon />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "10px"
                      }}
                    >
                      <Box
                        sx={{
                          padding: "5px",
                          border: "1px solid #e7e0e0",
                          borderRadius: "5px"
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: "black",
                            width: "30px",
                            height: "30px"
                          }}
                        ></Box>
                      </Box>
                      <Box
                        sx={{
                          paddingLeft: "10px"
                        }}
                      >
                        <Box
                          sx={{
                            paddingBottom: "3px",
                            fontWeight: "bold"
                          }}
                        >
                          Black
                        </Box>
                        <Box
                          sx={{
                            fontWeight: "400",
                            color: "rgb(175, 172, 172);"
                          }}
                        >
                          #000000 or RGB 0/0/0
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    <ox></ox>
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
                        fontWeight: "500",
                        borderRadius: "20px",
                        padding: "5px 8px"
                      }}
                    >
                      Default
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        paddingX: "5px"
                      }}
                    >
                      <ModeIcon></ModeIcon>
                    </Box>
                    <Box
                      sx={{
                        display: "flex"
                      }}
                    >
                      <CloseIcon
                        sx={{
                          height: "16px"
                        }}
                      />
                    </Box>
                  </Box>
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
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    width: "100%",
                    justifyContent: "space-between"
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <FilterListIcon />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "10px"
                      }}
                    >
                      <Box
                        sx={{
                          padding: "5px",
                          border: "1px solid #e7e0e0",
                          borderRadius: "5px"
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: "black",
                            width: "30px",
                            height: "30px"
                          }}
                        ></Box>
                      </Box>
                      <Box
                        sx={{
                          paddingLeft: "10px"
                        }}
                      >
                        <Box
                          sx={{
                            paddingBottom: "3px",
                            fontWeight: "bold"
                          }}
                        >
                          Black
                        </Box>
                        <Box
                          sx={{
                            fontWeight: "400",
                            color: "rgb(175, 172, 172);"
                          }}
                        >
                          #000000 or RGB 0/0/0
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    <ox></ox>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        paddingX: "5px"
                      }}
                    >
                      <ModeIcon></ModeIcon>
                    </Box>
                    <Box
                      sx={{
                        display: "flex"
                      }}
                    >
                      <CloseIcon
                        sx={{
                          height: "16px"
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box></Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "between"
              }}
            >
              <Box>
                <Button
                  variant="contained"
                  size="medium"
                  sx={{
                    paddingInline: "30px",
                    backgroundColor: "#1976d2"
                  }}
                >
                  Add Colors
                </Button>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Button size="small">Apply colors to all text Customizations</Button>
                <Button size="small">Add popular font colors</Button>
              </Box>
              <Box></Box>
            </Box>
          </Box>
          <Box
            sx={{
              paddingTop: "30px"
            }}
          >
            2 of 50 colors added
          </Box>
        </Box>
      </Box>
      {/* <div>
        <Box
          sx={{
            paddingTop: "40px"
          }}
        >
          <Box
            sx={{
              fontSize: "28px",
              fontWeight: "500"
            }}
          >
            Text Blocks
          </Box>
          <Box>Select additional text blocks to add to the customization area.</Box>
        </Box>
      </div> */}
    </div>
  );
};

export default DataCustomisation;
