import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CircularProgress,
  FormHelperText,
  Grid,
  styled,
  TextField,
  InputAdornment,
  IconButton
} from "@mui/material";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useEffect } from "react";
import ConfirmModal from "app/components/ConfirmModal";
// STYLED COMPONENTS
// const StyledRoot = styled("div")(() => ({
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   backgroundColor: "#1A2038",
//   minHeight: "100vh !important",

//   "& .card": {
//     maxWidth: 400,
//     margin: "1rem",
//     borderRadius: 12
//   },

//   ".img-wrapper": {
//     display: "flex",
//     padding: "2rem",
//     alignItems: "center",
//     justifyContent: "center"
//   }
// }));

// const ContentBox = styled("div")(({ theme }) => ({
//   padding: 32,
//   background: theme.palette.background.default
// }));

const StyledRoot = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#1A2038",
  minHeight: "100vh !important",

  "& .card": {
    maxWidth: 400,
    margin: "1rem",
    borderRadius: 12
  },

  ".img-wrapper": {
    display: "flex",
    padding: "2rem",
    alignItems: "center",
    justifyContent: "center"
  }
}));

const validationSchema = Yup.object().shape({
  // current_password: Yup.string()
  //   .required("Current password is required")
  //   .min(8, "Current password must be at least 8 characters"),

  new_password: Yup.string()
    .required("New password is required")
    .min(8, "New password must be at least 8 characters"),

  confirm_password: Yup.string()
    .required("Confirm password is required")
    .min(8, "Confirm password must be at least 8 characters")
    .oneOf([Yup.ref("new_password"), null], "Confirm password must match the new password")
});

const ContentBox = styled("div")(({ theme }) => ({
  padding: 32,
  background: theme.palette.background.default
}));

const BlackBorderTextField = styled(TextField)({
  "& label": {
    color: "black"
  },
  "& label.Mui-focused": {
    color: "black"
  },
  "& .MuiInputBase-input": {
    color: "black"
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "black"
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "black"
    },
    "&:hover fieldset": {
      borderColor: "black"
    },
    "&.Mui-focused fieldset": {
      borderColor: "black"
    }
  }
});

export default function ForgotPassword() {
  // const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [open, setOpen] = useState(false);
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

  const { token } = useParams();

  const handleChangePass = async (values, resetForm) => {
    setLoading(true);
    try {
      const payload = {
        token: token,
        newPassword: values.new_password
      };
      const res = await ApiService.login(apiEndpoints.resetPass, payload);
      if (res?.status === 200) {
        console.log("resetRes---", res);
        resetForm();
        // navigate(ROUTE_CONSTANT.login);
        setRoute(ROUTE_CONSTANT.login);
        handleOpen("success", res?.data);
      }
    } catch (error) {
      handleOpen("error", error);
    } finally {
      setLoading(false);
    }
  };

  const checkToken = async () => {
    try {
      const payload = {
        token: token,
        check: true
      };
      const res = await ApiService.login(apiEndpoints.resetPass, payload);
      if (res?.status === 200) {
        console.log("resetRes---", res);
      }
    } catch (error) {
      // console.log(error?.response?.data?.message);
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const handleSubmit = (values, { resetForm }) => {
    handleChangePass(values, resetForm);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <StyledRoot>
        <Card className="card">
          <Grid container>
            <Grid item xs={12}>
              <h3 style={{ textAlign: "center", marginBottom: "0" }}>Update Password</h3>
              <div className="img-wrapper">
                <img width="300" src="/assets/images/illustrations/dreamer.svg" alt="" />
              </div>
              <ContentBox>
                <Formik
                  initialValues={{ new_password: "", confirm_password: "" }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, resetForm }) => (
                    <Form noValidate>
                      {/* <Field
                      as={BlackBorderTextField}
                      required
                      fullWidth
                      type="password"
                      name="current_password"
                      size="medium"
                      label="Current Password"
                      variant="outlined"
                      id="current_password"
                      sx={{ mb: 3, width: "100%" }}
                      error={touched.current_password && Boolean(errors.current_password)}
                      helperText={touched.current_password && errors.current_password}
                    /> */}
                      <Field
                        as={BlackBorderTextField}
                        required
                        fullWidth
                        type={`${showNewPassword === true ? "text" : "password"}`}
                        name="new_password"
                        size="medium"
                        label="New Password"
                        variant="outlined"
                        id="new_password"
                        sx={{ mb: 3, width: "100%" }}
                        error={touched.new_password && Boolean(errors.new_password)}
                        helperText={touched.new_password && errors.new_password}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onMouseDown={handleMouseDownPassword}
                                sx={{ color: "black" }}
                                edge="end"
                              >
                                {showNewPassword === true ? (
                                  <VisibilityOff onClick={() => setShowNewPassword(false)} />
                                ) : (
                                  <Visibility onClick={() => setShowNewPassword(true)} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <Field
                        as={BlackBorderTextField}
                        required
                        fullWidth
                        type={`${showCPassword === true ? "text" : "password"}`}
                        name="confirm_password"
                        size="medium"
                        label="Confirm Password"
                        variant="outlined"
                        id="confirm_password"
                        sx={{ mb: 3, width: "100%" }}
                        error={touched.confirm_password && Boolean(errors.confirm_password)}
                        helperText={touched.confirm_password && errors.confirm_password}
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

                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        endIcon={loading ? <CircularProgress size={15} /> : ""}
                        disabled={loading}
                      >
                        Reset Password
                      </Button>
                    </Form>
                  )}
                </Formik>
                <Button
                  fullWidth
                  color="primary"
                  variant="outlined"
                  onClick={() => navigate(ROUTE_CONSTANT.login)}
                  sx={{ mt: 2 }}
                >
                  Go Back To Login
                </Button>
              </ContentBox>
            </Grid>
          </Grid>
        </Card>
      </StyledRoot>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
}
