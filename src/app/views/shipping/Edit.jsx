import React from "react";
import { Box, Button, Divider, Paper, Stack, TextField, Autocomplete } from "@mui/material";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate, useSearchParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import AppsIcon from "@mui/icons-material/Apps";
import { useState } from "react";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import { useEffect, useCallback } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import Grid from "@mui/material/Grid";

const Edit = () => {
  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");
  const [formValues, setFormValues] = useState({
    fName: "",
    lName: "",
    email: "",
    address: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    phone: ""
  });
  const [errors, setErrors] = useState({
    fName: "",
    lName: "",
    email: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    phone: ""
  });
  const [countryData, setCountryData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  console.log({ formValues });
  console.log({ errors });

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

  const getUser = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getAffiliateUserById}/${queryId}`, auth_key);
      if (res?.status === 200) {
        const resData = res?.data?.user;
        setFormValues((prev) => ({
          ...prev,
          fName: resData?.first_name,
          lName: resData?.last_name,
          email: resData?.email,
          address: resData?.address,
          address2: resData?.address_2,
          country: resData?.country_id,
          state: resData?.state_id,
          city: resData?.city_id,
          postalCode: resData?.pin_code,
          phone: resData?.phone
        }));
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (queryId) {
      getUser();
    } else {
      setFormValues({
        fName: "",
        lName: "",
        email: "",
        address: "",
        address2: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
        phone: ""
      });
    }
  }, [queryId]);

  const handleUpdateUser = async () => {
    const newErrors = {};
    if (!formValues.fName) newErrors.fName = "First Name is required";
    if (!formValues.lName) newErrors.lName = "Last Name is required";
    if (!formValues.email) newErrors.email = "Email is required";
    if (formValues.email && !emailRegex.test(formValues.email)) newErrors.email = "Invalid Email";
    if (!formValues.country) newErrors.country = "Country is required";
    if (!formValues.state) newErrors.state = "State is required";
    if (!formValues.city) newErrors.city = "City is required";
    if (!formValues.phone) newErrors.phone = "Mobile No is required";
    if (!formValues.postalCode) newErrors.postalCode = "Postal Code is required";
    if (!formValues.address) newErrors.address = "Address is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const payload = {
          _id: queryId,
          email: formValues?.email,
          mobile: formValues?.phone,
          first_name: formValues?.fName,
          last_name: formValues?.lName,
          country_id: formValues?.country,
          state_id: formValues?.state,
          city_id: formValues?.city,
          pin_code: formValues?.postalCode,
          address: formValues?.address,
          address_2: formValues?.address2
        };
        const res = await ApiService.post(apiEndpoints.updateAffiliateUser, payload, auth_key);
        if (res?.status === 200) {
          setRoute(ROUTE_CONSTANT.affiliateUser.list);
          handleOpen("success", res?.data);
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      setFormValues((prev) => ({ ...prev, country: value, state: "", city: "" }));
    } else if (name === "state") {
      setFormValues((prev) => ({ ...prev, state: value, city: "" }));
    } else if (name === "phone" || name === "postalCode") {
      if (/^\d*$/.test(value)) {
        setFormValues((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };

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
    [auth_key, formValues.country]
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
    [auth_key, formValues.state]
  );

  useEffect(() => {
    getCountryList();
  }, []);

  useEffect(() => {
    const selectedCountryId = countryData.filter((item) => item._id === formValues.country);
    if (selectedCountryId.length > 0) {
      getStateList(selectedCountryId[0]?._id);
    }
  }, [formValues.country, countryData]);

  useEffect(() => {
    const selectedStateId = stateData.filter((item) => item._id === formValues.state);
    if (selectedStateId.length > 0) {
      getCityList(selectedStateId[0]?._id);
    }
  }, [formValues.state, stateData]);

  return (
    <>
      <Box sx={{ margin: "30px" }}>
        <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
          <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
            <Box>
              <AppsIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
            </Box>
          </Stack>
          <Divider />
          <Box sx={{ ml: "24px", mt: "16px" }}>
            <Button
              onClick={() => navigate(ROUTE_CONSTANT.affiliateUser.users.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Affiliate Users
            </Button>
          </Box>
        </Box>
        <Box sx={{ p: "24px" }} component={Paper}>
          <h2 style={{ marginTop: "0" }}>Edit</h2>
          <Grid container spacing={2} alignItems={"center"}>
            <Grid item lg={6} md={6} xs={12} mb={1}>
              <TextField
                error={errors.fName && true}
                helperText={errors.fName}
                onBlur={() => {
                  if (!formValues.fName) {
                    setErrors((prv) => ({ ...prv, fName: "First Name is Required" }));
                  }
                }}
                name="fName"
                label="First Name"
                onChange={handleChange}
                value={formValues.fName}
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
              />
            </Grid>
            <Grid item lg={6} md={6} xs={12} mb={1}>
              <TextField
                error={errors.lName && true}
                helperText={errors.lName}
                onBlur={() => {
                  if (!formValues.lName) {
                    setErrors((prv) => ({ ...prv, lName: "Last Name is Required" }));
                  }
                }}
                name="lName"
                label="Last Name"
                onChange={handleChange}
                value={formValues.lName}
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
              />
            </Grid>
            <Grid item lg={6} md={6} xs={12} mb={1}>
              <TextField
                type="email"
                error={errors.email && true}
                helperText={errors.email}
                onBlur={() => {
                  if (!formValues.email) {
                    setErrors((prv) => ({ ...prv, email: "Email is Required" }));
                  }
                }}
                name="email"
                label="Email"
                onChange={handleChange}
                value={formValues.email}
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
              />
            </Grid>

            <Grid item lg={6} md={6} xs={12} mb={1}>
              <TextField
                error={errors.address && true}
                helperText={errors.address}
                onBlur={() => {
                  if (!formValues.address) {
                    setErrors((prv) => ({ ...prv, address: "Address is Required" }));
                  }
                }}
                name="address"
                label="Address"
                onChange={handleChange}
                value={formValues.address}
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
              />
            </Grid>

            <Grid item lg={6} md={6} xs={12} mb={1}>
              <TextField
                name="address2"
                label="Address 2"
                onChange={handleChange}
                value={formValues.address2}
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
              />
            </Grid>

            <Grid item lg={6} md={6} xs={12} mb={1}>
              <Autocomplete
                id="single-select-country"
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
                  handleChange({
                    target: {
                      name: "country",
                      value: newValue ? newValue._id : ""
                    }
                  });
                }}
                onBlur={() => {
                  if (!formValues.country) {
                    setErrors((prev) => ({ ...prev, country: "Country is Required" }));
                  }
                }}
                value={countryData.find((item) => item._id === formValues.country) || null}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </Grid>
            <Grid item lg={6} md={6} xs={12} mb={1}>
              <Autocomplete
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
                  handleChange({
                    target: {
                      name: "state",
                      value: newValue ? newValue._id : ""
                    }
                  });
                }}
                onBlur={() => {
                  if (!formValues.state) {
                    setErrors((prev) => ({ ...prev, state: "State is Required" }));
                  }
                }}
                value={stateData.find((item) => item._id === formValues.state) || null}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </Grid>

            <Grid item lg={6} md={6} xs={12} mb={1}>
              <Autocomplete
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
                  handleChange({
                    target: {
                      name: "city",
                      value: newValue ? newValue._id : ""
                    }
                  });
                }}
                onBlur={() => {
                  if (!formValues.city) {
                    setErrors((prev) => ({ ...prev, city: "City is Required" }));
                  }
                }}
                value={cityData.find((item) => item._id === formValues.city) || null}
                isOptionEqualToValue={(option, value) => option._id === value._id}
              />
            </Grid>

            <Grid item lg={6} md={6} xs={12} mb={1}>
              <TextField
                error={errors.postalCode && true}
                helperText={errors.postalCode}
                onBlur={() => {
                  if (!formValues.postalCode) {
                    setErrors((prv) => ({ ...prv, postalCode: "Postal Code is Required" }));
                  }
                }}
                name="postalCode"
                label="Postal Code"
                onChange={handleChange}
                value={formValues.postalCode}
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
              />
            </Grid>

            <Grid item lg={6} md={6} xs={12} mb={1}>
              <TextField
                error={errors.phone && true}
                helperText={errors.phone}
                onBlur={() => {
                  if (!formValues.phone) {
                    setErrors((prv) => ({ ...prv, phone: "Mobile No. is Required" }));
                  }
                }}
                name="phone"
                label="Mobile No."
                onChange={handleChange}
                value={formValues.phone}
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
              />
            </Grid>

            <Grid item xs={12} textAlign={"end"}>
              <Button
                variant="contained"
                onClick={handleUpdateUser}
                sx={{
                  background: "#000",
                  border: "none",
                  borderRadius: "5px",
                  color: "#fff",
                  padding: "6px 18px",
                  "&:hover": { background: "#545454" }
                }}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default Edit;
