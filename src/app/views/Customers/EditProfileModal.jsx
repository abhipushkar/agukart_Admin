import React, { useState, useEffect } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, CircularProgress, Typography,
  Autocomplete
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import ConfirmModal from "app/components/ConfirmModal";
import { localStorageKey } from "app/constant/localStorageKey";

const EditProfileModal = ({ userdata, getUserById }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_no: "",
    city: "",
    state: "",
    country: ""
  });
  console.log({formData},"tyjhtjtjtyjt")

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState(null);
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [allCountries, setAllCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);

  const getCountryData = async () => {
    try {
      const res = await ApiService.getWithoutAuth(apiEndpoints.getCountry, auth_key);
      if (res.status === 200) {
        setAllCountries(res?.data?.contryList);
      }
    } catch (error) {
      console.error("Country fetch error", error);
    }
  };

  const getStateData = async (countryId) => {
    try {
      const res = await ApiService.login(apiEndpoints.getStates, { country_id: countryId });
      if (res.status === 200) {
        setAllStates(res?.data?.stateList);
        setAllCities([]);
      }
    } catch (error) {
      console.error("State fetch error", error);
    }
  };

  const getCitiesData = async (stateId) => {
    try {
      const res = await ApiService.login(apiEndpoints.getCities, { state_id: stateId });
      if (res.status === 200) {
        setAllCities(res?.data?.result);
      }
    } catch (error) {
      console.error("City fetch error", error);
    }
  };

  useEffect(() => {
    getCountryData();
  }, []);

  useEffect(() => {
    if (formData.country) {
      getStateData(formData.country);
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state) {
      getCitiesData(formData.state);
    }
  }, [formData.state]);

  useEffect(() => {
    if (open) {
      setFormData({
        name: userdata?.name || "",
        email: userdata?.email || "",
        mobile_no: userdata?.mobile|| "",
        city: userdata?.city_id || "",
        state: userdata?.state_id || "",
        country: userdata?.country_id || ""
      });
      setErrors({});
    }
  }, [open, userdata]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const validate = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name) tempErrors.name = "Name is required";
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) tempErrors.email = "Invalid email format";
    if (!formData.mobile_no) tempErrors.mobile_no = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobile_no)) tempErrors.mobile_no = "Enter valid 10-digit number";
    if (!formData.city) tempErrors.city = "City is required";
    if (!formData.state) tempErrors.state = "State is required";
    if (!formData.country) tempErrors.country = "Country is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        _id: userdata?._id,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile_no,
        country_id: formData.country,
        state_id: formData.state,
        city_id: formData.city
      };
      const res = await ApiService.post(apiEndpoints.updateCustomer, payload, auth_key);
      if (res?.status === 200) {
        setType("success");
        setMsg(res?.data?.message);
        setConfirmOpen(true);
        setOpen(false);
        getUserById && getUserById();
      }
    } catch (err) {
      setType("error");
      setMsg(err?.response?.data?.message || "Something went wrong");
      setConfirmOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography component="div" textAlign="end">
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setOpen(true)}>
          Edit
        </Button>
      </Typography>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Profile
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            label="Mobile No"
            name="mobile_no"
            fullWidth
            margin="normal"
            value={formData.mobile_no}
            onChange={handleChange}
            error={!!errors.mobile_no}
            helperText={errors.mobile_no}
            inputProps={{ maxLength: 10 }}
          />
          <Autocomplete
            options={allCountries}
            getOptionLabel={(option) => option.name || ""}
            value={allCountries.find((c) => c._id === formData.country) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                country: newValue?._id || "",
                state: "",
                city: ""
              }));
              setErrors((prev) => ({ ...prev, country: "" }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                margin="normal"
                fullWidth
                error={!!errors.country}
                helperText={errors.country}
              />
            )}
          />
          <Autocomplete
              options={allStates}
              getOptionLabel={(option) => option.name || ""}
              value={allStates.find((s) => s._id === formData.state) || null}
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  state: newValue?._id || "",
                  city: ""
                }));
                setErrors((prev) => ({ ...prev, state: "" }));
              }}
              disabled={!formData.country}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  margin="normal"
                  fullWidth
                  error={!!errors.state}
                  helperText={errors.state}
                />
              )}
            />
          <Autocomplete
            options={allCities}
            getOptionLabel={(option) => option.name || ""}
            value={allCities.find((c) => c._id === formData.city) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                city: newValue?._id || ""
              }));
              setErrors((prev) => ({ ...prev, city: "" }));
            }}
            disabled={!formData.state}
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                margin="normal"
                fullWidth
                error={!!errors.city}
                helperText={errors.city}
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmModal open={confirmOpen} handleClose={() => setConfirmOpen(false)} type={type} msg={msg} />
    </>
  );
};

export default EditProfileModal;
