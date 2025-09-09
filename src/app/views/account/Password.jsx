import React from "react";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CircleIcon from "@mui/icons-material/Circle";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import * as Yup from "yup";

import {
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
  FormControl,
  CircularProgress,
  InputAdornment,
  IconButton
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ConfirmModal from "app/components/ConfirmModal";

const Password = ({ value }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
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

  const initialValues = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  };

  const validationSchema = Yup.object({
    currentPassword: Yup.string().required("Current Password is required"),
    newPassword: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("New Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm Password is required")
  });

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const handleFormSubmit = async (values, { resetForm }) => {
    setLoading(true);
    const payload = {
      old_password: values.currentPassword,
      new_password: values.newPassword,
      confirm_password: values.confirmPassword
    };
    try {
      const res = await ApiService.post(apiEndpoints.changePassword, payload, auth_key);
      console.log(res);
      if (res.status === 200) {
        resetForm();
        setLoading(false);
        handleOpen("success", res?.data);
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = (id) => {
    if (id === 1) setShowPassword((prevShowPassword) => !prevShowPassword);
    if (id === 2) setShowPassword2((prevShowPassword) => !prevShowPassword);
    if (id === 3) setShowPassword3((prevShowPassword) => !prevShowPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            <TabPanel value={value} index={1}>
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
                      <Grid container spacing={2} pb={2} sx={{ width: "100%", margin: "0" }}>
                        <Grid md={6} lg={6} sm={12} xs={12}>
                          <Grid md={12} lg={12} sm={12} xs={12}>
                            <FormControl>
                              <Field
                                as={TextField}
                                required
                                id="filled-password-input"
                                label="Current Password"
                                name="currentPassword"
                                type={showPassword ? "text" : "password"}
                                error={touched.currentPassword && Boolean(errors.currentPassword)}
                                helperText={touched.currentPassword && errors.currentPassword}
                                xs={{ width: "100%" }}
                                sx={{
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
                                        onClick={() => handleClickShowPassword(1)}
                                        onMouseDown={handleMouseDownPassword}
                                        sx={{ color: "white" }}
                                        edge="end"
                                      >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={12} lg={12} sm={12} xs={12}>
                            <FormControl>
                              <Field
                                as={TextField}
                                required
                                id="filled-password-input1"
                                label="New Password"
                                name="newPassword"
                                type={showPassword2 ? "text" : "password"}
                                error={touched.newPassword && Boolean(errors.newPassword)}
                                helperText={touched.newPassword && errors.newPassword}
                                xs={{ width: "100%" }}
                                sx={{
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
                                        onClick={() => handleClickShowPassword(2)}
                                        onMouseDown={handleMouseDownPassword}
                                        sx={{ color: "white" }}
                                        edge="end"
                                      >
                                        {showPassword2 ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </FormControl>
                          </Grid>
                          <Grid md={12} lg={12} sm={12} xs={12}>
                            <FormControl>
                              <Field
                                as={TextField}
                                required
                                id="filled-password-input2"
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showPassword3 ? "text" : "password"}
                                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                                helperText={touched.confirmPassword && errors.confirmPassword}
                                xs={{ width: "100%" }}
                                sx={{
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
                                        onClick={() => handleClickShowPassword(3)}
                                        onMouseDown={handleMouseDownPassword}
                                        sx={{ color: "white" }}
                                        edge="end"
                                      >
                                        {showPassword3 ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                    </InputAdornment>
                                  )
                                }}
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
                            <Button
                              endIcon={
                                loading ? (
                                  <CircularProgress sx={{ color: "white" }} size={15} />
                                ) : (
                                  ""
                                )
                              }
                              disabled={loading}
                              type="submit"
                              variant="contained"
                              sx={{ mr: 2 }}
                            >
                              Save Changes
                            </Button>
                            <Button type="reset" variant="outlined" sx={{ mr: 2 }}>
                              Cancel
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Box>
            </TabPanel>
          </Form>
        )}
      </Formik>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default Password;
