import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Autocomplete,
  MenuItem,
  IconButton,
  FormControl,
  InputAdornment,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch
} from "@mui/material";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import AppsIcon from "@mui/icons-material/Apps";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import ClearIcon from "@mui/icons-material/Clear";
import { useProfileData } from "app/contexts/profileContext";
import { set } from "lodash";
import QuillDes from "app/components/ReactQuillTextEditor/ReactQuillTextEditor/QuilDes";
import TextEditor from "app/components/TextEditor/TextEditor";

const Add = () => {
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");
  console.log(queryId, "queryId");
  const { logUserData, setLogUserData } = useProfileData();
  console.log(logUserData, "logUserData");
  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [formValues, setFormValues] = useState({
    title: "",
    return: false,
    exchange: false,
    days: "",
    description: ""
  });
  console.log({ formValues });
  const [errors, setErrors] = useState({
    title: "",
    days: "",
    description: ""
  });
  console.log(errors, "errors");

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  console.log({ formValues });

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

  const handleChange = (e) => {
    const { name, value,checked } = e.target;
    if(name=="return" || name=="exchange"){
        setFormValues((prev) => ({ ...prev, [name]: checked }));
    }else{
        setFormValues((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };

  const handleAddPolicy = async () => {
    const newErrors = {};
    if (!formValues.title) newErrors.title = "Policy title is required";
    if (!formValues.days) newErrors.days = "Return and exchange time is required";
    if (!formValues.description || formValues?.description === "<p><br></p>") newErrors.description = "Description is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const payload = {
          _id: queryId ? queryId : "new",
          policyTitle: formValues?.title,
          returns : formValues?.return,
          exchange : formValues?.exchange,
          returnExchangeTime: formValues?.days,
          description: formValues?.description
        };
        const res = await ApiService.post(apiEndpoints.addPolicy, payload, auth_key);
        if (res?.status === 200) {
          console.log("res---", res);
          // if (!queryId) {
          setRoute(ROUTE_CONSTANT.policySetting.list);
          // }
          handleOpen("success", res?.data);
        }
      } catch (error) {
        handleOpen("error", error?.response?.data || error);
      }
    }
  };
  const getPolicy = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getPolicyById}/${queryId}`, auth_key);
      if (res?.status === 200) {
        console.log("res-----", res);
        const resData = res?.data?.policy;
        setFormValues((prev) => ({
          ...prev,
          title: resData?.policyTitle,
          return:resData?.returns,
          exchange:resData?.exchange,
          days: resData?.returnExchangeTime,
          description: resData?.description
        }));
      }
    } catch (error) {
      handleOpen("error", error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (queryId) {
        getPolicy();
    }
  }, [queryId]);

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
              onClick={() => navigate(ROUTE_CONSTANT.policySetting.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Policy List
            </Button>
          </Box>
        </Box>
        <Box sx={{ p: "24px" }} component={Paper}>
            <Box
                sx={{
                display: "flex",
                marginBottom: "20px",
                gap: "20px"
                }}
            >
                <Box
                sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    wordBreak: "normal",
                    width: "15%",
                    textOverflow: "ellipsis",
                    display: "flex",
                    textWrap: "wrap"
                }}
                >
                Policy Title
                <span
                    style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                >
                    {" "}
                    *
                </span>
                :
                </Box>
                <Box width={"100%"}>
                <Box
                    sx={{
                    height: "auto", // Set your desired height
                    width: "100%"
                    }}
                >
                    <TextField
                    error={errors.title && true}
                    helperText={errors.title}
                    onBlur={() => {
                        if (!formValues.title) {
                        setErrors((prv) => ({ ...prv, title: "Policy title is required" }));
                        }
                    }}
                    name="title"
                    label="Policy Title"
                    onChange={handleChange}
                    value={formValues.title}
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
                </Box>
                </Box>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
                <Typography sx={{ fontSize: "14px", fontWeight: 700, width: "15%" }}>
                    Returns <span
                        style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                    >
                        {" "}
                        *
                    </span>:
                </Typography>
                <FormControlLabel
                control={<Switch checked={formValues.return} onChange={handleChange} name="return" />}
                label={formValues.return ? "I accept returns of this item" : "Returns not accepted"}
                />
            </Box>
            <Box display="flex" alignItems="center">
                <Typography sx={{ fontSize: "14px", fontWeight: 700, width: "15%" }}>
                    Exchanges <span
                        style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                    >
                        {" "}
                        *
                    </span>:
                </Typography>
                <FormControlLabel
                control={<Switch checked={formValues.exchange} onChange={handleChange} name="exchange" />}
                label={formValues.exchange ? "I accept exchanges of this item" : "Exchanges not accepted"}
                />
            </Box>
            <Box
                sx={{
                display: "flex",
                marginBottom: "20px",
                gap: "20px"
                }}
            >
                <Box
                sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    wordBreak: "normal",
                    width: "15%",
                    textOverflow: "ellipsis",
                    display: "flex",
                    textWrap: "wrap"
                }}
                >
                Return and exchange time
                <span
                    style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                >
                    {" "}
                    *
                </span>
                :
                </Box>
                <Box width={"100%"}>
                <Box
                    sx={{
                    height: "auto",
                    width: "100%"
                    }}
                >
                    <FormControl fullWidth>
                    <TextField
                        error={Boolean(errors.days)}
                        helperText={errors.days}
                        select
                        sx={{
                        "& .MuiInputBase-root": {
                            height: "40px"
                        },
                        "& .MuiFormLabel-root": {
                            top: "-7px"
                        }
                        }}
                        label="Select Return and exchange time (In days)"
                        labelId="pib"
                        id="pibb"
                        value={formValues?.days}
                        name="days"
                        onChange={handleChange}
                        InputProps={{
                        endAdornment: formValues?.days ? (
                            <InputAdornment position="end" sx={{ mr: 3 }}>
                            <IconButton
                                onClick={() => {
                                handleChange({ target: { name: "days", value: "" } });
                                setErrors((prv) => ({
                                    ...prv,
                                    days: "Return and exchange time is required"
                                }));
                                }}
                                edge="end"
                            >
                                <ClearIcon />
                            </IconButton>
                            </InputAdornment>
                        ) : null
                        }}
                    >
                        {[...Array(100)].map((_, index) => (
                        <MenuItem key={index + 1} value={index + 1}>
                            {index + 1}
                        </MenuItem>
                        ))}
                    </TextField>
                    </FormControl>
                </Box>
                </Box>
            </Box>
            <Box
                sx={{
                display: "flex",
                marginBottom: "20px",
                gap: "20px"
                }}
            >
                <Box
                sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                    wordBreak: "normal",
                    width: "15%",
                    textOverflow: "ellipsis",
                    display: "flex",
                    textWrap: "wrap"
                }}
                >
                Description <span
                    style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}
                >
                    {" "}
                    *
                </span>:
                </Box>
                <Box width={"100%"}>
                <Box
                    sx={{
                    height: "auto",
                    width: "100%"
                    }}
                >
                  <Box
                      sx={{
                          height: "auto", 
                          width: "100%"
                      }}
                  >
                      <QuillDes formValues={formValues} setFormValues={setFormValues} setErrors={setErrors} />
                  </Box>
                  {/* <TextEditor name="description" value={formValues?.description} setFormValues={setFormValues}/> */}
                  {errors.description && (
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#FF3D57",
                        marginLeft: "14px",
                        marginRight: "14px",
                        marginTop: "3px"
                      }}
                    >
                      {errors.description}
                    </Typography>
                  )}
                </Box>
                </Box>
            </Box>
            <Box
                sx={{
                display: "flex",
                justifyContent: "end",
                marginTop: "15px",
                gap: "5px"
                }}
            >
              <Button variant="contained" onClick={handleAddPolicy}>
                  Submit
              </Button>
            </Box>
        </Box>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default Add;
