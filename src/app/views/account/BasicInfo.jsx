import PropTypes from "prop-types";
import { useProfileData } from "app/contexts/profileContext";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { ApiService } from "app/services/ApiService";
import {
  Avatar,
  Box,
  Button,
  CardMedia,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputLabel,
  TextField,
  Typography,
  MenuItem,
  LinearProgress,
  Autocomplete
} from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CodeIcon from "@mui/icons-material/Code";
import PlaceIcon from "@mui/icons-material/Place";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LinearScaleOutlinedIcon from "@mui/icons-material/LinearScaleOutlined";
import { localStorageKey } from "app/constant/localStorageKey";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ConfirmModal from "app/components/ConfirmModal";

const TabPanel = React.memo(function TabPanel(props) {
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
});

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

const BasicInfo = ({ value }) => {
  const navigate = useNavigate();
  const { logUserData } = useProfileData();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    state: "",
    country: "",
    address:"",
    createdAt:"",
    sales:""
  });
  console.log({profileData});
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    city: "",
    state: "",
    country: "",
    address:"",
  });
  const [countryData, setCountryData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [org, setOrg] = useState("");

  useEffect(() => {
    if (logUserData) {
      setProfileData({
        name: logUserData?.name,
        email: logUserData?.email,
        mobile: logUserData?.mobile,
        city: logUserData?.city?._id,
        state: logUserData?.state?._id,
        country: logUserData?.country?._id,
        address:logUserData?.vendor?.shop_address,
        createdAt:logUserData?.vendor?.createdAt,
        sales:logUserData?.particularVendorSales
      });
    }
  }, [logUserData]);

  const formChangeHandler = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "country") {
      setProfileData((prev) => ({ ...prev, country: value, state: "", city: "" }));
    } else if (name === "state") {
      setProfileData((prev) => ({ ...prev, state: value, city: "" }));
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);
  console.log(profileData);

  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const designation_id = localStorage.getItem(localStorageKey.designation_id);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login);
  };

  const handleOpen = (type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut();
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (route !== null) {
      navigate(route);
    }
    setRoute(null);
    setMsg(null);
  };

  // const editProfileHandler = async () => {
  //   const payload = {
  //     name: profileData.name,
  //     email: profileData.email,
  //     mobile: profileData.mobile
  //   };
  //   try {
  //     const res = await ApiService.post(apiEndpoints.updateProfile, payload, auth_key);
  //     if (res?.status === 200) {
  //       // const res2 = toast.success(res?.data?.message);
  //       const res2 = res?.data;
  //       if (res2) {
  //         setTimeout(() => {
  //           // navigate(0);
  //           setRoute(0);
  //           handleOpen("success", res2);
  //         }, [1000]);
  //       }
  //     }
  //   } catch (error) {
  //     handleOpen("error", error);
  //   }
  // };

  const getCountryList = useCallback(async () => {
    try {
      const res = await ApiService.getWithoutAuth(apiEndpoints.getCountry, auth_key);
      if (res?.status == 200) {
        setCountryData(res?.data?.contryList);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  const getStateList = useCallback(
    async (id) => {
      try {
        const payload = {
          country_id: `${id}`
        };
        const res = await ApiService.login(apiEndpoints.getStates, payload);
        if (res.status == 200) {
          setStateData(res?.data?.stateList);
        }
      } catch (error) {
        handleOpen("error", error);
      }
    },
    [auth_key, profileData.country]
  );

  const getCityList = useCallback(
    async (id) => {
      try {
        const payload = {
          state_id: `${id}`
        };
        const res = await ApiService.login(apiEndpoints.getCities, payload);
        if (res.status == 200) {
          setCityData(res?.data?.result);
        }
      } catch (error) {
        handleOpen("error", error);
      }
    },
    [auth_key, profileData.state]
  );

  useEffect(() => {
    getCountryList();
  }, []);

  useEffect(() => {
    const selectedCountryId = countryData.filter((item) => item._id === profileData.country);
    if (selectedCountryId.length > 0) {
      getStateList(selectedCountryId[0]?._id);
    }
  }, [profileData.country, countryData]);

  useEffect(() => {
    const selectedStateId = stateData.filter((item) => item._id === profileData.state);
    if (selectedStateId.length > 0) {
      getCityList(selectedStateId[0]?._id);
    }
  }, [profileData.state, stateData]);

  return (
    <>
      <TabPanel value={value} index={0}>
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
              image={logUserData?.vendor?.shop_icon ? `${logUserData?.shopImageUrl}${logUserData?.vendor?.shop_icon}`:"https://cdn.pixabay.com/photo/2015/05/31/15/08/blank-792125_1280.jpg"}
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
                {/* <Input
                  id="photo-upload"
                  type="file"
                  aria-describedby="my-helper-text"
                  sx={{
                    display: "none"
                  }}
                /> */}
                <Avatar
                  alt="Remy Sharp"
                  src={
                    logUserData?.image ||
                    "https://m.media-amazon.com/images/M/MV5BZDk1ZmU0NGYtMzQ2Yi00N2NjLTkyNWEtZWE2NTU4NTJiZGUzXkEyXkFqcGdeQXVyMTExNDQ2MTI@._V1_FMjpg_UX1000_.jpg"
                  }
                  sx={{ width: 100, height: 100, margin: "0 auto" }}
                />
                {/* <IconButton
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
                </IconButton> */}
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
                {logUserData?.shopname}
              </Typography>
              {
                designation_id == "3" &&   <Grid container spacing={2}   sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}>
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
                      <TrendingUpIcon
                        sx={{
                          marginRight: "5px"
                        }}
                      />
                      {profileData?.sales}
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
                      Joined {profileData?.createdAt && new Date(profileData?.createdAt).getFullYear()}
                    </Box>
                  </Grid>
                </Grid>
              }
            </Grid>
          </Box>
        </Box>

        <Box
          sx={{
            boxShadow: 2,
            borderRadius: 2,
            backgroundColor: "#ffff",
            width: "100% !imporatnt",
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
                <Grid container spacing={2} pt={2} sx={{ width: "100%", margin: "0" }}>
                  <Grid item lg={6} md={6} xs={12} mb={1}>
                    <TextField
                      error={errors.name && true}
                      helperText={errors.name}
                      onBlur={() => {
                        if (!profileData.name) {
                          setErrors((prv) => ({ ...prv, name: "Name is Required" }));
                        }
                      }}
                      name="name"
                      label="Name"
                      onChange={formChangeHandler}
                      value={profileData.name}
                      rows={4}
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-root": {
                          height: "40px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                      disabled
                    />
                  </Grid>
                  <Grid item lg={6} md={6} xs={12} mb={1}>
                    <TextField
                      type="email"
                      error={errors.email && true}
                      helperText={errors.email}
                      onBlur={() => {
                        if (!profileData.email) {
                          setErrors((prv) => ({ ...prv, email: "Email is Required" }));
                        }
                      }}
                      name="email"
                      label="Email"
                      onChange={formChangeHandler}
                      value={profileData.email}
                      rows={4}
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-root": {
                          height: "40px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                      disabled
                    />
                  </Grid>
                        <Grid md={6} lg={6} sm={12} xs={12} mb={1}>
                    <TextField
                      error={errors.mobile && true}
                      helperText={errors.mobile}
                      id="outlined-required3"
                      name="mobile"
                      label="Mobile"
                      onChange={formChangeHandler}
                      value={profileData?.mobile}
                      xs={{ width: "100%" }}
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "40px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                      onBlur={() => {
                        if (!profileData.email) {
                          setErrors((prv) => ({ ...prv, mobile: "Mobile no. is Required" }));
                        }
                      }}
                      disabled
                    />
                  </Grid>
                   {
                    designation_id == "3" &&
                    <>
                      <Grid item lg={6} md={6} xs={12} mb={1}>
                        <Autocomplete
                          id="single-select-country"
                          disabled
                          options={countryData}
                          getOptionLabel={(option) => option.name}
                          renderInput={(params) => {
                            return (
                              <TextField
                                {...params}
                                label="Select Country"
                                placeholder="Select Country"
                                sx={{
                                  "& .MuiInputBase-root": {
                                    height: "40px",
                                    padding: "0 11px"
                                  },
                                  "& .MuiFormLabel-root": {
                                    top: "-7px"
                                  }
                                }}
                                error={errors.country && true}
                                helperText={errors.country}
                              />
                            );
                          }}
                          sx={{ width: "100%" }}
                          onChange={(event, newValue) => {
                            formChangeHandler({
                              target: {
                                name: "country",
                                value: newValue ? newValue._id : ""
                              }
                            });
                          }}
                          onBlur={() => {
                            if (!profileData.country) {
                              setErrors((prev) => ({ ...prev, country: "Country is Required" }));
                            }
                          }}
                          value={countryData.find((item) => item._id === profileData.country) || null}
                          isOptionEqualToValue={(option, value) => option._id === value._id}
                        />
                      </Grid>
                      <Grid item lg={6} md={6} xs={12} mb={1}>
                        <Autocomplete
                          disabled
                          id="single-select-state"
                          options={stateData}
                          getOptionLabel={(option) => option.name}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select State"
                              placeholder="Select State"
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: "40px",
                                  padding: "0 11px"
                                },
                                "& .MuiFormLabel-root": {
                                  top: "-7px"
                                }
                              }}
                              error={errors.state && true}
                              helperText={errors.state}
                            />
                          )}
                          sx={{ width: "100%" }}
                          onChange={(event, newValue) => {
                            formChangeHandler({
                              target: {
                                name: "state",
                                value: newValue ? newValue._id : ""
                              }
                            });
                          }}
                          onBlur={() => {
                            if (!profileData.state) {
                              setErrors((prev) => ({ ...prev, state: "State is Required" }));
                            }
                          }}
                          value={stateData.find((item) => item._id === profileData.state) || null}
                          isOptionEqualToValue={(option, value) => option._id === value._id}
                        />
                      </Grid>
                      <Grid item lg={6} md={6} xs={12} mb={1}>
                        <Autocomplete
                          disabled
                          id="single-select-city"
                          options={cityData}
                          getOptionLabel={(option) => option.name}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select City"
                              placeholder="Select City"
                              sx={{
                                "& .MuiInputBase-root": {
                                  height: "40px",
                                  padding: "0 11px"
                                },
                                "& .MuiFormLabel-root": {
                                  top: "-7px"
                                }
                              }}
                              error={errors.city && true}
                              helperText={errors.city}
                            />
                          )}
                          sx={{ width: "100%" }}
                          onChange={(event, newValue) => {
                            formChangeHandler({
                              target: {
                                name: "city",
                                value: newValue ? newValue._id : ""
                              }
                            });
                          }}
                          onBlur={() => {
                            if (!profileData.city) {
                              setErrors((prev) => ({ ...prev, city: "City is Required" }));
                            }
                          }}
                          value={cityData.find((item) => item._id === profileData.city) || null}
                          isOptionEqualToValue={(option, value) => option._id === value._id}
                        />
                      </Grid>
                      <Grid md={6} lg={6} sm={12} xs={12} mb={1}>
                        <TextField
                          disabled
                          error={errors.address && true}
                          helperText={errors.address}
                          id="outlined666-required"
                          label="Address"
                          name="address"
                          onChange={formChangeHandler}
                          value={profileData?.address}
                          xs={{ width: "100%" }}
                          sx={{
                            "& .MuiInputBase-root": {
                              height: "40px"
                            },
                            "& .MuiFormLabel-root": {
                              top: "-7px"
                            }
                          }}
                          onBlur={() => {
                            if (!profileData.address) {
                              setErrors((prev) => ({ ...prev, address: "Address is Required" }));
                            }
                          }}
                        />
                      </Grid>
                    </>
                  }
                  {/* <Grid item lg={12} md={12} sm={12} xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", paddingTop: "2px" }}>
                      <Button onClick={editProfileHandler} variant="contained" sx={{ mr: 2 }}>
                        Save Changes
                      </Button>
                      <Button variant="outlined" sx={{ mr: 2 }}>
                        Cancel
                      </Button>
                    </Box>
                  </Grid> */}
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Box>
      </TabPanel>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default BasicInfo;
