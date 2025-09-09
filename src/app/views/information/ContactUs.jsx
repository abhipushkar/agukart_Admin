import React from "react";
import {
  TextField,
  Button,
  Stack,
  Box,
  Container as MuiContainer,
  InputAdornment,
  CircularProgress,
  Autocomplete
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import styled from "@emotion/styled";
import { useState } from "react";
import { localStorageKey } from "app/constant/localStorageKey";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { toast } from "react-toastify";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCallback } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import SingleTextEditor from "app/components/TextEditor/SingleTextEditor";

const theme = createTheme();

const StyledContainer = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

const ContactUs = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

  const handleSubmit = async () => {
    if (!des) {
      setErrors("Description is required");
    } else {
      try {
        setLoading(true);
        const payload = {
          _id: id ? id : "new",
          type: "Privacy Policy",
          description: des
        };
        const res = await ApiService.post(apiEndpoints.updateInformation, payload, auth_key);
        if (res?.status === 200) {
          // navigate(ROUTE_CONSTANT.dashboard);
          setRoute(ROUTE_CONSTANT.dashboard);
          handleOpen("success", res?.data);
        }
      } catch (error) {
        setLoading(false);
        handleOpen("error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getInformation = useCallback(async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getInformation}/privacy-policy`, auth_key);
      if (res?.status === 200) {
        const resData = res?.data?.data;
        setDes(resData?.description);
        setId(resData?._id);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  useEffect(() => {
    getInformation();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <MuiContainer>
        <StyledContainer>
          <h2>Contact Us</h2>
          <form>
            <Box width={"100%"}>
             
            </Box>

            <Button
              endIcon={loading ? <CircularProgress size={15} /> : ""}
              disabled={loading ? true : false}
              sx={{ mr: "16px", mt: "60px" }}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </form>
        </StyledContainer>
      </MuiContainer>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </ThemeProvider>
  );
};

export default ContactUs;
