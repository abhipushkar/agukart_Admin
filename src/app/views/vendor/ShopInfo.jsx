import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  IconButton,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Typography,
  CircularProgress
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { localStorageKey } from "app/constant/localStorageKey";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import FormControl from "@mui/material/FormControl";
import ConfirmModal from "app/components/ConfirmModal";

const ShopInfo = ({
  formValues,
  errors,
  setFormValues,
  setErrors,
  setImages,
  setImageSrc,
  imageSrc,
  handleValidate,
  setValue,
  setInfoTab,
  setCheckShopInfo,
  queryId,
  loading,
  handleVendorSave
}) => {
  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const inputFileRef = React.useRef(null);

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login)
  };

  const handleOpen = (type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut()
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "country") {
      setFormValues((prev) => ({ ...prev, country: value, state: "", city: "" }));
    } else if (name === "state") {
      setFormValues((prev) => ({ ...prev, state: value, city: "" }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImages(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhoneChange = (value, data) => {
    setFormValues((prev) => ({
      ...prev,
      mobileCode: data.dialCode,
      mobileNo: value.replace(data.dialCode, "")
    }));
    setErrors((prv) => ({ ...prv, mobileNo: "" }));
  };

  const handleButtonClick = () => {
    inputFileRef.current.click();
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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

  const handleNext = () => {
    if (handleValidate("shopInfo")) {
        setValue("info")
        setCheckShopInfo(true)
        setInfoTab(true)
    }
  }

  return (
    <>
      <h2 style={{ marginTop: "0" }}>Add</h2>
      <Grid container spacing={2} alignItems={"center"}>
        <Grid item lg={6} md={6} xs={12} mb={1}>
          <TextField
            error={errors.name && true}
            helperText={errors.name}
            onBlur={() => {
              if (!formValues.name) {
                setErrors((prv) => ({ ...prv, name: "Name is Required" }));
              }
            }}
            name="name"
            label="Name"
            onChange={handleChange}
            value={formValues.name}
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
          <FormControl>
            <RadioGroup
              row
              aria-label="gender"
              name="gender"
              value={formValues.gender}
              onChange={handleChange}
              sx={{ alignItems: "center" }}
            >
              <FormLabel component="legend" sx={{ marginRight: "20px", fontSize: "18px" }}>
                Gender
              </FormLabel>
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="others" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
          {errors.gender && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#FF3D57",
                marginLeft: "14px",
                marginRight: "14px",
                marginTop: "3px"
              }}
            >
              {errors.gender}
            </Typography>
          )}
        </Grid>
        <Grid item lg={6} md={6} xs={12} mb={1}>
          <TextField
            type="date"
            error={errors.dob && true}
            helperText={errors.dob}
            onBlur={() => {
              if (!formValues.dob) {
                setErrors((prv) => ({ ...prv, dob: "Date of Birth is Required" }));
              }
            }}
            name="dob"
            onChange={handleChange}
            value={formValues.dob}
            rows={2}
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
          <PhoneInput
            country="in"
            enableSearch={true}
            autoFormat={true}
            value={`${formValues.mobileCode}${formValues.mobileNo}`}
            onChange={handlePhoneChange}
            onBlur={() => {
              if (!formValues.mobileNo) {
                setErrors((prev) => ({ ...prev, mobileNo: "Mobile number is required" }));
              } else {
                setErrors((prev) => ({ ...prev, mobileNo: "" }));
              }
            }}
            inputProps={{
              name: "phone",
              required: true,
              placeholder: "Enter mobile number"
            }}
            specialLabel=""
            containerStyle={{ width: "100%" }}
            inputStyle={{ width: "100%", height: "40px" }}
          />
          {errors.mobileNo && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#FF3D57",
                marginLeft: "14px",
                marginRight: "14px",
                marginTop: "3px"
              }}
            >
              {errors.mobileNo}
            </Typography>
          )}
        </Grid>

        <Grid item lg={12} md={6} xs={12} mb={1}>
          <div onClick={handleButtonClick} style={{ display: "flex", alignItems: "center" }}>
            <ControlPointIcon />
            <div style={{ marginLeft: "6px" }}>Upload Image</div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={inputFileRef}
            style={{ display: "none" }}
          />

          {errors.images && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#FF3D57",
                marginLeft: "14px",
                marginRight: "14px",
                marginTop: "3px"
              }}
            >
              {errors.images}
            </Typography>
          )}
          <Grid item xs={2} mb={1}>
            {imageSrc && (
              <Box>
                <img
                  src={imageSrc}
                  alt=""
                  style={{
                    aspectRatio: "9/5",
                    height: "100%",
                    width: "100%",
                    objectFit: "contain"
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>

        <Grid item lg={6} md={6} xs={12} mb={1}>
          <TextField
            type={`${showPassword === true ? "text" : "password"}`}
            error={errors.password && true}
            helperText={errors.password}
            onBlur={() => {
              if (!formValues.password) {
                setErrors((prv) => ({ ...prv, password: "Password is Required" }));
              }
            }}
            name="password"
            label="Password"
            onChange={handleChange}
            value={formValues.password}
            rows={2}
            sx={{
              width: "100%",
              "& .MuiInputBase-root": {
                height: "40px"
              },
              "& .MuiFormLabel-root": {
                top: "-7px"
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onMouseDown={handleMouseDownPassword}
                    sx={{ color: "black" }}
                    edge="end"
                  >
                    {showPassword === true ? (
                      <VisibilityOff onClick={() => setShowPassword(false)} />
                    ) : (
                      <Visibility onClick={() => setShowPassword(true)} />
                    )}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item lg={6} md={6} xs={12} mb={1}>
          <TextField
            type={`${showCPassword === true ? "text" : "password"}`}
            error={errors.cPassword && true}
            helperText={errors.cPassword}
            onBlur={() => {
              if (!formValues.cPassword) {
                setErrors((prv) => ({ ...prv, cPassword: "Confirm Password is Required" }));
              }
            }}
            name="cPassword"
            label="Confirm Password"
            onChange={handleChange}
            value={formValues.cPassword}
            rows={2}
            sx={{
              width: "100%",
              "& .MuiInputBase-root": {
                height: "40px"
              },
              "& .MuiFormLabel-root": {
                top: "-7px"
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onMouseDown={handleMouseDownPassword}
                    sx={{ color: "black" }}
                    edge="end"
                  >
                    {showCPassword === true ? (
                      <VisibilityOff onClick={() => setShowCPassword(false)} />
                    ) : (
                      <Visibility onClick={() => setShowCPassword(true)} />
                    )}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

       <Grid item xs={12} textAlign="end">
        {queryId && (
          <Button
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            disabled={loading}
            sx={{
              backgroundColor: "#000", // black
              borderRadius: "8px",
              color: "#fff",
              padding: "8px 20px",
              fontWeight: 500,
              textTransform: "capitalize",
              marginRight: 2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: "#333",
              },
              "&:disabled": {
                backgroundColor: "#888",
              }
            }}
            onClick={handleVendorSave}
          >
            Save
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{
            backgroundColor: "#43a047", // green
            borderRadius: "8px",
            color: "#fff",
            padding: "8px 20px",
            fontWeight: 500,
            textTransform: "capitalize",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            "&:hover": {
              backgroundColor: "#388e3c",
            }
          }}
        >
          Next
        </Button>
      </Grid>

      </Grid>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default ShopInfo;
