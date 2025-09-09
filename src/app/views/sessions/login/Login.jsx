import * as React from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect } from "react";
import { useState } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CircularProgress, IconButton, InputAdornment } from "@mui/material";
import { styled } from "@mui/system";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ConfirmModal from "app/components/ConfirmModal";

function Copyright(props) {
  return (
    <Typography variant="body2" color="white" align="center" {...props}>
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().required("Password is required")
});

const FirebaseRoot = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#1A2038",
  minHeight: "100vh !important",
  "& .card": { maxWidth: 800, margin: "1rem" },
  "& .cardLeft": {
    color: "#fff",
    height: "100%",
    display: "flex",
    padding: "32px 56px",
    flexDirection: "column",
    backgroundSize: "cover",
    background: "#161c37 url(/assets/images/bg-3.png) no-repeat",
    [theme.breakpoints.down("sm")]: { minWidth: 200 },
    "& img": { width: 32, height: 32 }
  },
  "& .mainTitle": { fontSize: 18, lineHeight: 1.3, marginBottom: 24 },
  "& .features": {
    "& .item": {
      position: "relative",
      marginBottom: 12,
      paddingLeft: 16,
      "&::after": {
        top: 8,
        left: 0,
        width: 4,
        height: 4,
        content: '""',
        borderRadius: 4,
        position: "absolute",
        backgroundColor: theme.palette.error.main
      }
    }
  }
}));

const WhiteBorderTextField = styled(TextField)({
  "& label": {
    color: "white"
  },
  "& label.Mui-focused": {
    color: "white"
  },
  "& .MuiInputBase-input": {
    color: "white"
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "white"
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "white"
    },
    "&:hover fieldset": {
      borderColor: "white"
    },
    "&.Mui-focused fieldset": {
      borderColor: "white"
    }
  }
});

export default function LogIn() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  console.log(msg,"----------")

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login)
  };

  const handleOpen = (type, msg) => {
    console.log(type,msg,"gggggggggggg")
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

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
        password: values.password
      };
      const res = await ApiService.login(apiEndpoints.login, payload);
      console.log(res);
      if (res.status === 200) {
        localStorage.setItem(localStorageKey.auth_key, res?.data?.token);
        localStorage.setItem(localStorageKey.designation_id, res?.data?.user?.designation_id);
        if (res?.data?.user?.designation_id === 3) {
          localStorage.setItem(localStorageKey.vendorId, res?.data?.user?._id);
        }
        // navigate(ROUTE_CONSTANT.dashboard);
        setRoute(ROUTE_CONSTANT.dashboard);
        handleOpen("success", res?.data);
      }
    } catch (error) {
      console.log( error?.response?.data?.message,"error");
      handleOpen("error", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const authKey = localStorage.getItem(localStorageKey.auth_key);
    if (authKey) {
      navigate(ROUTE_CONSTANT.dashboard);
    }
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = (values) => {
    handleFormSubmit(values);
  };

  return (
    <FirebaseRoot>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography color={"white"} component="h1" variant="h5">
              Login Dashboard
            </Typography>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form noValidate>
                  <Field
                    as={WhiteBorderTextField}
                    margin="normal"
                    required
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    id="email"
                    autoComplete="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <Field
                    as={WhiteBorderTextField}
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
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
                  <Button
                    sx={{ width: "100%" }}
                    variant="contained"
                    type="submit"
                    endIcon={loading ? <CircularProgress size={15} /> : ""}
                    disabled={loading}
                  >
                    Login
                  </Button>
                </Form>
              )}
            </Formik>
            <Button
              fullWidth
              color="primary"
              variant="outlined"
              onClick={() => navigate(ROUTE_CONSTANT.resetPass)}
              sx={{ mt: 2 }}
            >
              Forgot your password?
              Reset It
            </Button>
          </Box>
          <Copyright sx={{ mt: 1, mb: 4 }} />
        </Container>
        <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
      </ThemeProvider>
    </FirebaseRoot>
  );
}
