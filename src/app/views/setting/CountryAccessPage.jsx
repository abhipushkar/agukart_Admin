import {
  Box,
  Button,
  Typography,
  FormControl,
  Checkbox,
  ListItemText,
  Autocomplete,
  TextField,
  CircularProgress
} from "@mui/material";
import { Breadcrumb } from "app/components";
import styled from "@emotion/styled";
import React, { useState, useEffect, useCallback } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { toast } from "react-toastify";
import ConfirmModal from "app/components/ConfirmModal";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate } from "react-router-dom";

const CountryAccessPage = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  const getCountryList = useCallback(async () => {
    try {
      const res = await ApiService.getWithoutAuth(apiEndpoints.getCountry, auth_key);
      if (res?.status === 200) {
        setCountries(res?.data?.contryList || []);
      }
    } catch (error) {
      console.log("Error fetching countries:", error);
      handleOpen("error", error?.response?.data || error);
    }
  }, [auth_key]);

  const getBlockedCountries = useCallback(async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getBlockedCountries, auth_key);
      if (res?.status === 200) {
        const blocked = res?.data?.countries || [];
        setSelectedCountries(blocked);
      }
    } catch (error) {
      console.error("Error fetching blocked countries:", error);
      handleOpen("error", error?.response?.data || error);
    }
  }, [auth_key]);

  useEffect(() => {
    getCountryList();
    getBlockedCountries();
  }, []);

  const handleCountrySelect = (event, newValue) => {
    setSelectedCountries(newValue);
  };

  const handleBlockCountries = async () => {
    setLoading(true);
    try {
      const payload = {
        country_names: selectedCountries.map((country) => country.name)
      };
      const res = await ApiService.post(apiEndpoints.countriesBlocked, payload, auth_key);
      if (res?.status === 200) {
        setLoading(false);
        handleOpen("success", res?.data);
        console.log("Countries blocked:", res.data);
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error?.response?.data || error);
      console.error("Error blocking countries:", error);
    }
  };

  return (
    <>
      <Container>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          className="breadcrumb"
        >
          <Breadcrumb
            routeSegments={[{ name: "Settings", path: "" }, { name: "Country Access" }]}
          />
        </Box>

        <Box sx={{ marginTop: 3 }}>
          <Typography variant="h6">Select Countries to Block</Typography>

          <FormControl fullWidth sx={{ marginTop: 2 }}>
            <Autocomplete
              multiple
              id="country-select"
              options={countries}
              getOptionLabel={(option) => option.name}
              value={selectedCountries}
              onChange={handleCountrySelect}
              isOptionEqualToValue={(option, value) => option.name === value.name}
              renderInput={(params) => <TextField {...params} label="Select Countries" />}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox checked={selected} />
                  <ListItemText primary={option.name} />
                </li>
              )}
            />
          </FormControl>

          <Box sx={{ marginTop: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBlockCountries}
              endIcon={loading ? <CircularProgress sx={{ color: "white" }} size={15} /> : ""}
              disabled={loading || selectedCountries.length === 0}
              sx={{ marginRight: 2 }}
            >
              Block Selected Countries
            </Button>
          </Box>
        </Box>
      </Container>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default CountryAccessPage;
