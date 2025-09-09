import {
  Box,
  Button,
  FormControl,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  TableSortLabel,
  Grid,
  Typography,
  Autocomplete,
  Checkbox,
  ListItem,
  List,
  Menu,
  InputAdornment,
  Modal,
  CircularProgress
} from "@mui/material";
import React, { useCallback, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { localStorageKey } from "app/constant/localStorageKey";
import { useNavigate } from "react-router-dom";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import Rating from "@mui/material/Rating";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmModal from "app/components/ConfirmModal";
import EditIcon from '@mui/icons-material/Edit';
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const validationSchemaForExpiry = Yup.object({
  validityDate: Yup.date().required("Validity date is required"),
});

const PurchaesHistory = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [tab, setTab] = useState("0");
  const [giftcards, setGiftcards] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [expiryDate,setExpiryDate] = useState(null);
  console.log({expiryDate})

  const navigate = useNavigate();

  //   console.log({ reviewIds });

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [openExpiryModal, setOpenExpiryModal] = useState(false);
  const [giftCardId, setGiftCardId] = useState("");
  const [loading,setLoading] = useState(false);


  const handleOpenModal = (id) => {
    setGiftCardId(id);
    setOpenModal(true)
  }
  const handleExpiryDateModal = (item) => {
    setGiftCardId(item?._id);
    setExpiryDate(item?.expiry_date);
    setOpenExpiryModal(true)
  }

  const handleExipryDateModal = () => {
    setGiftCardId("");
    setOpenExpiryModal(false);
  }
  const handleCloseModal = () => {
    setGiftCardId("");
    setOpenModal(false)
  }
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

  const handleResend = async (values,resetForm) => {
    try {
      const payload = {
        _id: giftCardId,
        email: values?.email,
      };
      setLoading(true);
      const res = await ApiService.post("resendMailForGiftCardCodeByAdmin", payload,auth_key);
      if (res.status === 200) {
        setLoading(false);
        resetForm();
        handleCloseModal();
        handleOpen("success",res?.data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error resending gift card:", error);
      handleOpen("error", error?.response?.data || error);
    }
  };

  const handleUpdateValidity = async (values,resetForm)=>{
    try {
      const formattedDate = dayjs(values.validityDate).format('YYYY-MM-DD');
      const payload = {
        id: giftCardId,
        expiryDate: formattedDate,
      };
      setLoading(true);
      const res = await ApiService.post("extend-gift-card-expiry-date", payload,auth_key);
      if (res.status === 200) {
        setLoading(false);
        resetForm();
        handleExipryDateModal();
        getPurchaesGiftCardHistory();
        handleOpen("success",res?.data);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error resending gift card:", error);
      handleOpen("error", error?.response?.data || error);
    }
  }

  const handleTabChange = (event, newValue) => {
    setGiftcards([]);
    setTab(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPurchaesGiftCardHistory = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getPurchaesGiftCardHistory}/${tab}`, auth_key);
      console.log(res?.data?.history);
      setGiftcards(res?.data?.history);
    } catch (error) {
        handleOpen("error", error?.response?.data || error);
    }
  };
  useEffect(() => {
    getPurchaesGiftCardHistory();
  }, [tab]);

  const capitalizeFirstWord = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  
  function formatToIST(utcDateStr) {
    const date = new Date(utcDateStr);
  
    const options = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
  
    const formatter = new Intl.DateTimeFormat('en-IN', options);
  
    const parts = formatter.formatToParts(date).reduce((acc, part) => {
      if (part.type !== 'literal') {
        acc[part.type] = part.value;
      }
      return acc;
    }, {});
  
    // Output format: YYYY-MM-DD HH:mm:ss
    return `${parts.day}-${parts.month}-${parts.year}`;
  }

  return (
    <>
      <Box sx={{ padding: "30px", background: "#fff" }}>
        <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
          <Grid lg={6} md={6} xs={6}>
            <Typography variant="h5" fontWeight={600}>
              Gift Card Purchaes History
            </Typography>
          </Grid>
        </Grid>
        <Grid container width={"100%"} m={0} pt={4} spacing={2}>
          <Grid lg={12} md={12} xs={12}>
            <Box>
              <TabContext value={tab}>
                <Box>
                  <TabList
                    onChange={handleTabChange}
                    aria-label="lab API tabs example"
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Pending" value="0" />
                    <Tab label="Complete" value="1" />
                  </TabList>
                </Box>
                <TabPanel value={tab} sx={{ padding: "24px 0" }}></TabPanel>
              </TabContext>
            </Box>
          </Grid>
        </Grid>
        <Box>
          <TableContainer sx={{ paddingLeft: 2, paddingRight: 2 }} component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Order Id</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell>Gift Card Name</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Delivery Date</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  {tab === "0" && <TableCell sx={{ textAlign: "center" }}>Action</TableCell>}
                </TableRow>
              </TableHead>
              {giftcards?.length > 0 ? (
                <TableBody>
                  {giftcards.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item?.orderId}</TableCell>
                      <TableCell>{capitalizeFirstWord(item?.user_id)}</TableCell>
                      <TableCell>{item?.description}</TableCell>
                      <TableCell>{item?.amount}</TableCell>
                      <TableCell>{formatToIST(item?.createdAt || "")}</TableCell>
                      <TableCell>{formatToIST(item?.delivery_date || "")}</TableCell>
                      <TableCell>{formatToIST(item?.expiry_date || "")}</TableCell>
                      {
                        tab === "0" && item?.isRedeemed == "0" && (
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpenModal(item?._id)}
                                sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
                              >
                                Re-send Gift Card
                              </Button>
                              <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleExpiryDateModal(item)}
                                sx={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
                              >
                                Extends Expiry Date
                              </Button>
                            </Box>
                          </TableCell>
                        )
                      }
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody scope="row">
                  <TableCell colSpan={tab == "0" ? 5 : 4} sx={{ textAlign: "center" }}>
                    No giftcards Found
                  </TableCell>
                </TableBody>
              )}
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 75, 100]}
            component="div"
            count={giftcards?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Enter Email to Re-send Gift Card
          </Typography>

          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={(values,{resetForm}) => handleResend(values,resetForm)}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
      <Modal open={openExpiryModal} onClose={handleExipryDateModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>
          Enter Extends Expiry Date
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Formik
            enableReinitialize
            initialValues={{ validityDate: expiryDate ?  dayjs(expiryDate.split('T')[0]) : null }}
            validationSchema={validationSchemaForExpiry}
            onSubmit={(values,{resetForm}) => handleUpdateValidity(values,resetForm)}
          >
            {({ setFieldValue, values, errors, touched }) => (
              <Form>
                <DatePicker
                  label="Select Date"
                  value={values.validityDate}
                  onChange={(newValue) => setFieldValue('validityDate', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={touched.validityDate && Boolean(errors.validityDate)}
                      helperText={touched.validityDate && errors.validityDate}
                    />
                  )}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  Update Validity
                </Button>
              </Form>
            )}
          </Formik>
        </LocalizationProvider>
      </Box>
      </Modal>
    </>
  );
};

export default PurchaesHistory;
