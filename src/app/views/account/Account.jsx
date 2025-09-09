import styled from "@emotion/styled";
import React, { useState } from "react";
import PropTypes from "prop-types";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CodeIcon from "@mui/icons-material/Code";
import PlaceIcon from "@mui/icons-material/Place";
import LinearProgress from "@mui/material/LinearProgress";
import LockIcon from "@mui/icons-material/Lock";
import InboxIcon from "@mui/icons-material/Inbox";
import MailIcon from "@mui/icons-material/Mail";
import { Divider, Drawer, Icon, ListItemButton, ListItemIcon, useMediaQuery } from "@mui/material";
import Password from "./Password";

import BasicInfo from "./BasicInfo";
import {
  Avatar,
  Box,
  Tab,
  Tabs,
  Button,
  Checkbox,
  Container,
  Grid,
  Stack,
  PersonOutline,
  InputLabel,
  Input,
  Typography,
  FormControl
} from "@mui/material";
import { localStorageKey } from "app/constant/localStorageKey";

const Account = () => {
  const StyledContainer = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
  };

  function a11yProps(index) {
    return {
      id: `vertical-tab-${index}`,
      "aria-controls": `vertical-tabpanel-${index}`
    };
  }

  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
 const designation_id = localStorage.getItem(localStorageKey.designation_id);
  const DrawerList = (
    <Box sx={{ width: 250, padding: "8px" }} role="presentation" onClick={toggleDrawer(false)}>
      {/* <List>
        {["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {["All mail", "Trash", "Spam"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
      <Box>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{
            ".MuiTabs-indicator": {
              left: "0 !important",
              width: "3px"
            },
            ".Mui-selected": {
              background: "rgb(245, 245, 245)"
            },
            ".MuiTab-root": {
              textAlign: "left",
              position: "relative",
              textTransform: "capitalize",
              fontWeight: 400,
              color: "#000",
              "&::before": {
                left: "0px",
                width: "3px",
                content: '""',
                height: "100%",
                opacity: 0,
                position: "absolute",
                transition: "all 0.3s ease 0s",
                background: "rgb(25, 118, 210)"
              },

              ".MuiSvgIcon-root": {
                color: "#c1bdbd"
              },
              "&:hover": {
                backgroundColor: "#f5f5f5"
              },

              "&:hover:before": {
                opacity: "1"
              }
            },
            ".MuiButtonBase-root": {
              fontSize: "14px",
              alignItems: "center",
              justifyContent: "start",
              maxWidth: "100%",
              minHeight: "100%"
            }
          }}
        >
          <Tab
            sx={{ px: "24", py: "10" }}
            icon={<PersonOutlineIcon />}
            iconPosition="start"
            label="Basic Information"
            {...a11yProps(0)}
          />
          {
            designation_id === "2" && (
              <Tab
                sx={{ px: "24", py: "10" }}
                icon={<LockIcon />}
                iconPosition="start"
                label="Change Password"
                {...a11yProps(1)}
              />
            )
          }
        </Tabs>
      </Box>
    </Box>
  );

  const isLargeScreen = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  return (
    <>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>

      <Container sx={{ position: "relative" }} maxWidth="100%">
        <Grid container spacing={2} sx={{ padding: "20px 0" }}>
          {isLargeScreen && (
            <Grid
              container
              item
              md={5}
              sm={12}
              xs={12}
              lg={4}
              sx={{
                display: "block"
              }}
            >
              <Box
                sx={{
                  boxShadow: 2,
                  borderRadius: 2,
                  backgroundColor: "#ffff",
                  width: "100%",
                  padding: "16px 0"
                }}
              >
                <Box>
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{
                      ".MuiTabs-indicator": {
                        left: "0 !important",
                        width: "3px"
                      },
                      ".Mui-selected": {
                        background: "rgb(245, 245, 245)"
                      },
                      ".MuiTab-root": {
                        textAlign: "left",
                        position: "relative",
                        textTransform: "capitalize",
                        fontWeight: 400,
                        color: "#000",
                        "&::before": {
                          left: "0px",
                          width: "3px",
                          content: '""',
                          height: "100%",
                          opacity: 0,
                          position: "absolute",
                          transition: "all 0.3s ease 0s",
                          background: "rgb(25, 118, 210)"
                        },

                        ".MuiSvgIcon-root": {
                          color: "#c1bdbd"
                        },
                        "&:hover": {
                          backgroundColor: "#f5f5f5"
                        },

                        "&:hover:before": {
                          opacity: "1"
                        }
                      },
                      ".MuiButtonBase-root": {
                        fontSize: "14px",
                        alignItems: "center",
                        justifyContent: "start",
                        maxWidth: "100%",
                        minHeight: "100%"
                      }
                    }}
                  >
                    <Tab
                      icon={<PersonOutlineIcon />}
                      iconPosition="start"
                      label="Basic Information"
                      {...a11yProps(0)}
                    />
                    {
                      designation_id == "2" && <Tab
                        icon={<LockIcon />}
                        iconPosition="start"
                        label="Password"
                        {...a11yProps(1)}
                      />
                    }
                  </Tabs>
                </Box>
              </Box>
            </Grid>
          )}

          {!isLargeScreen && (
            <Stack
              direction={"row"}
              alignItems={"center"}
              gap={"8px"}
              sx={{
                paddingLeft: "32px",
                marginTop: "16px"
              }}
            >
              <IconButton onClick={toggleDrawer(true)} sx={{ padding: 0 }}>
                <Icon color="primary">apps</Icon>
              </IconButton>
              <Typography
                variant="h5"
                sx={{ fontSize: "14px", fontWeight: "500", lineHeight: "1.5" }}
              >
                Show More
              </Typography>
            </Stack>
          )}

          <Grid
            container
            item
            md={12}
            lg={8}
            sm={12}
            xs={12}
            sx={{
              ".css-19kzrtu ": {
                padding: "0 !important"
              }
            }}
          >
            <Grid
              md={12}
              lg={12}
              sm={12}
              xs={12}
              sx={{
                width: "100%"
              }}
            >
              {/* <TabPanel value={value} index={0}>
                <Box
                  sx={{
                    boxShadow: 2,
                    borderRadius: 2,
                    backgroundColor: "#ffff",
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                    padding: "24px"
                  }}
                >
                  <Box
                    sx={{
                      top: "0px",
                      left: "0px",
                      height: "125px",
                      width: "100%",
                      overflow: "hidden",
                      position: "absolute",
                      background: "rgb(198, 211, 237)"
                    }}
                  >
                    <CardMedia
                      component="img"
                      image="https://cdn.pixabay.com/photo/2015/05/31/15/08/blank-792125_1280.jpg"
                      alt="Paella dish"
                      sx={{ objectFit: "cover" }}
                    />
                  </Box>
                  <Box
                    sx={{
                      zIndex: "1",
                      marginTop: "55px",
                      position: "relative"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        width: "100%"
                      }}
                    >
                      <InputLabel
                        htmlFor="photo-upload"
                        sx={{ position: "relative", width: "140px", margin: "0 auto" }}
                      >
                        <Input
                          id="photo-upload"
                          type="file"
                          aria-describedby="my-helper-text"
                          sx={{
                            display: "none"
                          }}
                        />
                        <Avatar
                          alt="Remy Sharp"
                          src="https://m.media-amazon.com/images/M/MV5BZDk1ZmU0NGYtMzQ2Yi00N2NjLTkyNWEtZWE2NTU4NTJiZGUzXkEyXkFqcGdeQXVyMTExNDQ2MTI@._V1_FMjpg_UX1000_.jpg"
                          sx={{ width: 100, height: 100, margin: "0 auto" }}
                        />
                        <IconButton
                          sx={{
                            position: "absolute",
                            bottom: "-6px",
                            right: "4px"
                          }}
                        >
                          <CameraAltIcon
                            sx={{
                              background: "#3284d6",
                              borderRadius: "50%",
                              height: "35px",
                              width: "35px",
                              padding: "7px",
                              color: "#fff"
                            }}
                          />
                        </IconButton>
                      </InputLabel>
                    </Box>
                    <Grid item lg={8} md={12} sm={12} xs={12} sx={{ margin: "0 auto" }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontSize: "16px",
                          fontWeight: "500",
                          lineHeight: "1.5",
                          marginTop: "16px",
                          marginBottom: "8px",
                          textAlign: "center"
                        }}
                      >
                        Ben Peterson
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item lg={4} md={4} sm={12} xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "14px",
                              color: "rgba(52, 49, 76, 0.38)",
                              fontWeight: 600
                            }}
                          >
                            <CodeIcon
                              sx={{
                                marginRight: "5px"
                              }}
                            />
                            Developer
                          </Box>
                        </Grid>
                        <Grid item lg={4} md={4} sm={12} xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "14px",
                              color: "rgba(52, 49, 76, 0.38)",
                              fontWeight: 600
                            }}
                          >
                            <PlaceIcon
                              sx={{
                                marginRight: "5px"
                              }}
                            />
                            New York
                          </Box>
                        </Grid>
                        <Grid item lg={4} md={4} sm={12} xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              fontSize: "14px",
                              color: "rgba(52, 49, 76, 0.38)",
                              fontWeight: 600
                            }}
                          >
                            <CalendarMonthOutlinedIcon
                              sx={{
                                marginRight: "5px"
                              }}
                            />
                            Joined March 17
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      lg={12}
                      md={12}
                      sm={12}
                      xs={12}
                      sx={{ marginTop: "25px", display: "flex", alignItems: "center" }}
                    >
                      <Grid container spacing={2}>
                        <Grid item lg={4} md={5} sm={12} xs={12}>
                          <Typography>Profile Completion</Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress variant="determinate" />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2">50%</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item lg={8} md={7} sm={12} xs={12}>
                          <Box
                            sx={{ display: "flex", alignItems: "center", justifyContent: "end" }}
                          >
                            <Button variant="outlined" sx={{ mr: 2 }}>
                              Follow
                            </Button>
                            <Button variant="contained" sx={{ mr: 2 }}>
                              Hire Me
                            </Button>
                            <Button variant="text">
                              <LinearScaleOutlinedIcon />
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <Box
                  sx={{
                    boxShadow: 2,
                    borderRadius: 2,
                    backgroundColor: "#ffff",
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                    marginTop: "30px",
                    padding: "20px 0",

                    ".css-mhc70k-MuiGrid-root": {
                      margin: "0px !important",
                      padding: "22px 20px",
                      width: "100% !important"
                    },

                    ".MuiGrid-grid-lg-6": {
                      padding: "12px 12px"
                    },

                    ".MuiFormControl-root": {
                      width: "100%"
                    }
                  }}
                >
                  <Grid md={12} lg={12} sm={12}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: "16px",
                        fontWeight: "500",
                        lineHeight: "1.5",
                        borderBottom: "1px solid #cdcaca",
                        padding: "0 27px 15px 29px"
                      }}
                    >
                      Basic Information
                    </Typography>
                    <Box>
                      <Grid md={12} lg={12} sm={12}>
                        <Grid container spacing={2}>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                required
                                id="outlined-required"
                                label="First Name"
                                defaultValue="Hello World"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                required
                                id="outlined-required"
                                label="Last Name"
                                defaultValue="Hello World"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                required
                                id="outlined-required"
                                label="Email"
                                defaultValue="Hello World"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                required
                                id="outlined-required"
                                label="Phone"
                                defaultValue="+443322221111"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                required
                                id="outlined-required"
                                label="Organization"
                                defaultValue="UiLib"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                required
                                id="outlined-required"
                                label="Department"
                                defaultValue="Develop"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                id="outlined-select-currency"
                                select
                                label="Country"
                                defaultValue="United Kingdom"
                              >
                                {currencies.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </FormControl>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                required
                                id="outlined-required"
                                label="State"
                                defaultValue="New York"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                required
                                id="outlined-required"
                                label="Address"
                                defaultValue="Corverview, Michigan"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>

                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <FormControl>
                              <TextField
                                id="outlined-number"
                                label="Zip Code"
                                type="number"
                                defaultValue="4346"
                                xs={{ width: "100%" }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid item lg={12} md={12} sm={12} xs={12}>
                            <Box sx={{ display: "flex", alignItems: "center", paddingTop: "2px" }}>
                              <Button variant="contained" sx={{ mr: 2 }}>
                                Save Changes
                              </Button>
                              <Button variant="outlined" sx={{ mr: 2 }}>
                                Cancel
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Box>
              </TabPanel> */}

              <BasicInfo value={value} />
            </Grid>

            <Grid
              md={12}
              lg={12}
              sm={12}
              xs={12}
              sx={{
                width: "100%"
              }}
            >
              {/* <TabPanel value={value} index={1}>
                <Box
                  sx={{
                    boxShadow: 2,
                    borderRadius: 2,
                    backgroundColor: "#ffff",
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                    padding: "6px 0",

                    ".css-mhc70k-MuiGrid-root": {
                      margin: "0px !important",
                      padding: "22px 20px",
                      width: "100% !important"
                    },

                    ".MuiGrid-grid-lg-6": {
                      padding: "12px 12px"
                    },
                    ".css-1nuw9uu-MuiGrid-root": {
                      padding: "12px 0px"
                    },

                    ".MuiFormControl-root": {
                      width: "100%"
                    },

                    ".MuiList-root": {
                      padding: "0px"
                    },
                    ".MuiListItem-root": {
                      paddingLeft: "0px",
                      paddingRight: "0px"
                    },

                    ".MuiSvgIcon-root": {
                      fontSize: "13px",
                      marginRight: "8px",
                      color: "#1976d2"
                    },

                    ".css-12rcprn-MuiTypography-root": {
                      fontSize: "13px"
                    },

                    ".MuiListItemText-root": {
                      margin: "0px"
                    }
                  }}
                >
                  <Grid md={12} lg={12} sm={12}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: "16px",
                        fontWeight: "500",
                        lineHeight: "1.5",
                        borderBottom: "1px solid #cdcaca",
                        padding: "0 27px 15px 29px"
                      }}
                    >
                      Password
                    </Typography>
                    <Box>
                      <Grid md={12} lg={12} sm={12}>
                        <Grid container spacing={2}>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <Grid md={12} lg={12} sm={12} xs={12}>
                              <FormControl>
                                <TextField
                                  required
                                  id="filled-password-input"
                                  label="Current Password"
                                  type="password"
                                  xs={{ width: "100%" }}
                                />
                              </FormControl>
                            </Grid>
                            <Grid md={12} lg={12} sm={12} xs={12}>
                              <FormControl>
                                <TextField
                                  required
                                  id="filled-password-input"
                                  label="New Password"
                                  type="password"
                                  xs={{ width: "100%" }}
                                />
                              </FormControl>
                            </Grid>
                            <Grid md={12} lg={12} sm={12} xs={12}>
                              <FormControl>
                                <TextField
                                  required
                                  id="filled-password-input"
                                  label="Confirm Password"
                                  type="password"
                                  xs={{ width: "100%" }}
                                />
                              </FormControl>
                            </Grid>
                          </Grid>
                          <Grid md={6} lg={6} sm={12} xs={12}>
                            <Grid md={12} lg={12} sm={12} xs={12}>
                              <Typography
                                variant="h5"
                                sx={{
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  lineHeight: "1.5",
                                  marginBottom: "5px"
                                }}
                              >
                                Password requirements:
                              </Typography>
                              <Typography
                                component={"small"}
                                sx={{
                                  fontSize: "14px",
                                  lineHeight: "1.5"
                                }}
                              >
                                Ensure that these requirements are met:
                              </Typography>
                              <List sx={{ width: "100%", marginTop: "12px" }}>
                                <ListItem>
                                  <CircleIcon />
                                  <ListItemText primary="Minimum 8 characters long - the more, the better" />
                                </ListItem>
                                <ListItem>
                                  <CircleIcon />
                                  <ListItemText primary="Minimum 8 characters long - the more, the better" />
                                </ListItem>
                                <ListItem>
                                  <CircleIcon />
                                  <ListItemText primary="Minimum 8 characters long - the more, the better" />
                                </ListItem>
                                <ListItem>
                                  <CircleIcon />
                                  <ListItemText primary="Minimum 8 characters long - the more, the better" />
                                </ListItem>
                              </List>
                            </Grid>
                          </Grid>
                          <Grid item lg={12} md={12} sm={12} xs={12}>
                            <Box sx={{ display: "flex", alignItems: "center", paddingTop: "2px" }}>
                              <Button variant="contained" sx={{ mr: 2 }}>
                                Save Changes
                              </Button>
                              <Button variant="outlined" sx={{ mr: 2 }}>
                                Cancel
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Box>
              </TabPanel> */}

              <Password value={value} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Account;
