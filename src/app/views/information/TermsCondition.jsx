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
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useCallback } from "react";
import { useEffect } from "react";
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

const TermsCondition = () => {
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
          type: "Terms & Conditions",
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
      const res = await ApiService.get(`${apiEndpoints.getInformation}/terms-condition`, auth_key);
      if (res?.status === 200) {
        console.log({ res });
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
          <h2>Terms & Condition</h2>
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
    </ThemeProvider>
  );
};

export default TermsCondition;
