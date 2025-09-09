import React from "react";
import { Button, Card, CircularProgress, Grid, styled, TextField } from "@mui/material";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { localStorageKey } from "app/constant/localStorageKey";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ConfirmModal from "app/components/ConfirmModal";

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
  email: Yup.string().email("Invalid email address").required("Email is required")
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

const ResetPassword = () => {
  const [email, setEmail] = useState();
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

  const handleResetPass = async (values, resetForm) => {
    setLoading(true);
    try {
      const resetPassLink = `${apiEndpoints.resetPassLink}`;
      const payload = { email: values.email };
      const res = await ApiService.login(resetPassLink, payload);
      if (res?.status === 200) {
        console.log("resetResLink---", res?.data?.message);
        resetForm();
        handleOpen("success", res?.data);
      }
    } catch (error) {
      handleOpen("error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values, { resetForm }) => {
    handleResetPass(values, resetForm);
  };

  useEffect(() => {
    const authKey = localStorage.getItem(localStorageKey.auth_key);
    if (authKey) {
      navigate(ROUTE_CONSTANT.dashboard);
    }
  }, []);

  return (
    <>
      <StyledRoot>
        <Card className="card">
          <Grid container>
            <Grid item xs={12}>
              <h3 style={{ textAlign: "center", marginBottom: "0" }}>Reset Password</h3>
              <ContentBox>
                <Formik
                  initialValues={{ email: "" }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, resetForm }) => (
                    <Form noValidate>
                      <Field
                        as={BlackBorderTextField}
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

                      <Button
                        fullWidth
                        color="primary"
                        variant="outlined"
                        onClick={() => navigate(ROUTE_CONSTANT.login)}
                        sx={{ mt: 2 }}
                      >
                        Go Back To Login
                      </Button>
                    </Form>
                  )}
                </Formik>
              </ContentBox>
            </Grid>
          </Grid>
        </Card>
      </StyledRoot>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default ResetPassword;
