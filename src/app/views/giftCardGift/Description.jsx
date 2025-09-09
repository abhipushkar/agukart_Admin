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
import QuillDes from "app/components/ReactQuillTextEditor/SingleReactQuillTextEditor/QuilDes";
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

const Description = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [id, setId] = useState("");
  const [des, setDes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
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
          description: des
        };
        const res = await ApiService.post(apiEndpoints.AddGiftCardDescription, payload, auth_key);
        if (res?.status === 200) {
          // navigate(ROUTE_CONSTANT.dashboard);
          setRoute(ROUTE_CONSTANT.giftCard.description);
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

  const getDescription = useCallback(async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getGiftCardDescription}`, auth_key);
      if (res?.status === 200) {
        const resData = res?.data?.description;
        setDes(resData?.description);
        setId(resData?._id);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  useEffect(() => {
    getDescription();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <MuiContainer>
        <StyledContainer>
          <h2>Description</h2>
          <form>
            <Box width={"100%"}>
              <Box
                sx={{
                  height: "auto", // Set your desired height
                  width: "100%"
                }}
              >
                <QuillDes des={des} setDes={setDes} setErrors={setErrors} />
              </Box>
              {/* <SingleTextEditor value={des} setDescription={setDes}/> */}
              {errors && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors}
                </Typography>
              )}
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

export default Description;
