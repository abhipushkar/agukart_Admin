import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  InputLabel,
  Popper,
  Paper,
  TextField,
  Grid,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  InputAdornment,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import React from "react";
import Divider from "@mui/material/Divider";
import { useTheme } from "@emotion/react";
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import DownloadIcon from "@mui/icons-material/Download";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useState } from "react";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TuneIcon from '@mui/icons-material/Tune';
import AdjustWalletBalance from "./AdjustWalletBalance";
import EditProfileModal from "./EditProfileModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useCallback } from "react";
import CustomerDataModal from "./CustomerDataModal";
import LoginAsCustomerModal from "./LoginAsCustomerModal";
import CustomerGraph from "./CustomerGraph";
import MessagePopup from "./MessagePopup";
import ContactMailIcon from "@mui/icons-material/ContactMail";
const Details = ({ userdata,getUserById }) => {
  const [openPopup, SetOpenPopup] = useState(false);
  console.log(userdata, "userdata");
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [statusData, setStatusData] = useState({});

   const handleClickPopup = () => {
    SetOpenPopup(true);
  };

  const handleClosePopup = () => {
    SetOpenPopup(false);
  };

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

  const handleStatusChange = useCallback(async () => {
    if (statusData) {
      try {
        const res = await ApiService.post(
          `${apiEndpoints.updateUserStatus}/${statusData?._id}`,
          { status: statusData.status },
          auth_key
        );
        if (res.status === 200) {
          getUserById();
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  }, [auth_key, getUserById, statusData]);

  const MyStyledStack = styled(Stack)(({ theme }) => ({
    backgroundColor: "white",

    borderRadius: 8,
    flexDirection: "coloum"
  }));

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250
      }
    }
  };

  function getStyles(name, personName, theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium
    };
  }

  const theme = useTheme();
  const [personName, setPersonName] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const [selectVal, setSelectVal] = useState(10);

  const handleSelectChange = (event) => {
    setSelectVal(event.target.value);
  };

  function formatDateTime(dateString) {
    if (!dateString) return "-";  // agar dateString undefined/null ho toh hyphen show kare

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "-"; // agar invalid date ho toh bhi hyphen show kare

    // Format example: 29 May 2025, 14:35
    const options = {
      year: 'numeric',
      month: 'short',    // May, Jun etc.
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false      // 24-hour format. Agar 12-hour chahiye toh true kar dena
    };

    return date.toLocaleString('en-US', options);
  }


  return (
    <Grid container spacing={3} backgroundColor={"#fff"}>
      <Grid item lg={5} md={6} sm={12} xs={12}>
        <MyStyledStack sx={{ boxShadow: 1, flexDirection: 'column', alignItems: 'center' }}>
          <Box width={'100%'} p={"24px"}>
            <Stack direction={"column"} alignItems={"center"}>
              <Avatar
                alt="Remy Sharp"
                src={userdata?.image ? userdata?.image : "assets/images/default_user.png"}
                sx={{ width: 84, height: 84 }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "1.5",
                  marginTop: "16px",
                  marginBottom: "8px"
                }}
              >
                {userdata?.name}
              </Typography>
              <Typography
                component={"small"}
                sx={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.5", color: "#91909E" }}
              >
                {userdata?.gender ? userdata.gender.charAt(0).toUpperCase() + userdata.gender.slice(1) : ''}
              </Typography>
            </Stack>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid item>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<ContactMailIcon />} 
                  onClick={handleClickPopup}
                >
                  Contact
                </Button>
              </Grid>
              <Grid item>
                <EditProfileModal userdata={userdata} getUserById={getUserById} />
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    <Typography component="span" fontWeight={500}>Account Status</Typography>
                  </TableCell>
                  <TableCell align="left">{userdata?.status == true ? "Active": "Suspended"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Last Login Date
                  </TableCell>
                  <TableCell align="left">{formatDateTime(userdata?.updatedAt || "")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Customer ID no.
                  </TableCell>
                  <TableCell align="left">{userdata?.id_number}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Joining Date
                  </TableCell>
                  <TableCell align="left">{formatDateTime(userdata?.createdAt || "")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Name
                  </TableCell>
                  <TableCell align="left">{userdata?.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Profession
                  </TableCell>
                  <TableCell align="left">{userdata?.profession}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Email
                  </TableCell>
                  <TableCell align="left">
                    <Typography component="div">
                      <Typography component="div">{userdata?.email}</Typography>
                      <Typography component="div" mt={1}>
                        <Typography component="span" color={"#019f57"} borderRadius={"4px"} backgroundColor={"#17d88b54"} p={"4px"}>{userdata?.email_verified}</Typography>
                      </Typography>
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Old Emails
                  </TableCell>
                  <TableCell align="left"></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Phone
                  </TableCell>
                  <TableCell align="left">{userdata?.phone_code} {userdata?.mobile}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Country
                  </TableCell>
                  <TableCell align="left">{userdata?.country}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    State/Region
                  </TableCell>
                  <TableCell align="left">{userdata?.state}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    City
                  </TableCell>
                  <TableCell align="left">{userdata?.city}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Address 1
                  </TableCell>
                  <TableCell align="left">
                    {userdata?.userAddresses?.[0]
                      ? [
                        `${userdata.userAddresses[0]?.first_name} ${userdata.userAddresses[0]?.last_name}`,
                        userdata.userAddresses[0]?.address_line1,
                        userdata.userAddresses[0]?.address_line2,
                        userdata.userAddresses[0]?.city,
                        userdata.userAddresses[0]?.state,
                        userdata.userAddresses[0]?.pincode,
                        userdata.userAddresses[0]?.country,
                        `${userdata.userAddresses[0]?.phone_code} ${userdata.userAddresses[0]?.mobile}`,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "No Address Available"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Address 2
                  </TableCell>
                  <TableCell align="left">
                  {userdata?.userAddresses?.[1]
                      ? [`${userdata.userAddresses[1]?.first_name} ${userdata.userAddresses[1]?.last_name}`,
                        userdata.userAddresses[1]?.address_line1,
                        userdata.userAddresses[1]?.address_line2,
                        userdata.userAddresses[1]?.city,
                        userdata.userAddresses[1]?.state,
                        userdata.userAddresses[1]?.pincode,
                        userdata.userAddresses[1]?.country,
                        `${userdata.userAddresses[1]?.phone_code} ${userdata.userAddresses[1]?.mobile}`,
                      ]
                          .filter(Boolean)
                          .join(", ")
                      : "No Address Available"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ px: "16px" }} align="left">
                    Address 3
                  </TableCell>
                  <TableCell align="left">
                  {userdata?.userAddresses?.[2]
                      ? [`${userdata.userAddresses[2]?.first_name} ${userdata.userAddresses[2]?.last_name}`,
                        userdata.userAddresses[2]?.address_line1,
                        userdata.userAddresses[2]?.address_line2,
                        userdata.userAddresses[2]?.city,
                        userdata.userAddresses[2]?.state,
                        userdata.userAddresses[2]?.pincode,
                        userdata.userAddresses[2]?.country,
                        `${userdata.userAddresses[2]?.phone_code} ${userdata.userAddresses[2]?.mobile}`,
                      ]
                          .filter(Boolean)
                          .join(", ")
                      : "No Address Available"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align="left" colSpan={2}>
                    <Typography component="div" sx={{ display: "flex", alignItems: "center", flexDirection: { lg: "row", md: "row", sm: "row", xs: "column" }, justifyContent: { lg: "space-between", md: "space-between", sm: "space-between", xs: "center" } }}>
                      {userdata?.email_verified != "Confirmed" && <ResetPasswordModal userdata= {userdata} getUserById = {getUserById}/>}
                      <LoginAsCustomerModal userdata= {userdata} getUserById = {getUserById}/>
                    </Typography>
                  </TableCell>

                </TableRow>
              </TableBody>

            </Table>
          </TableContainer>
        </MyStyledStack>
        <MyStyledStack mt={3} sx={{ boxShadow: 1, flexDirection: 'column', alignItems: 'center' }}>
          <Box width={'100%'}>
            <Typography component="div" fontWeight={600} fontSize={16} p={3} borderBottom={"1px solid #efefef"}>Other Actions</Typography>
            <Typography component="div" p={3}>
              <Typography component="div"><Button variant="text" sx={{ color: '#000' }}><DoNotDisturbAltIcon sx={{ fontSize: '18px', marginRight: '8px' }} /> Closed Account</Button></Typography>
              <Typography component="div" mt={1}><Button variant="text" sx={{ color: '#000' }}><FileDownloadIcon sx={{ fontSize: '18px', marginRight: '8px' }} /> Export Data</Button></Typography>
              <Typography mt={2} color={"#8f8c8c"} display={"flex"} alignItems={"center"} gap={"6px"}><ErrorIcon sx={{ color: '#f1bc3b' }} />Once you delete account, data will be lost forever.</Typography>
              <Typography component="div" mt={2}>
                <Button variant="contained" startIcon={userdata?.status ? <DeleteIcon /> : <CheckCircleIcon />} sx={{marginRight:"5px"}} onClick={()=>{
                  handleOpen("customerStatus");
                  setStatusData(() => ({ _id: userdata._id, status: !userdata.status }));
                }}>
                  {userdata?.status ? "Disable Account" : "Enable Account"}
                </Button>
                <Button variant="contained" startIcon={<DeleteIcon />}>
                  Delete Account
                </Button>
              </Typography>
            </Typography>
          </Box>
        </MyStyledStack>
        <MyStyledStack mt={3} sx={{ boxShadow: 1, flexDirection: 'column', alignItems: 'center' }}>
          <Box width={'100%'}>
            <Typography component="div" fontWeight={600} fontSize={16} p={3} borderBottom={"1px solid #efefef"}>Send Email</Typography>
            <Typography component="div" p={3}>
              <Typography component="div">
                <FormControl fullWidth>
                  <Select
                    id="demo-simple-select"
                    value={selectVal}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value={10}>Resend Last Invoice</MenuItem>
                    <MenuItem value={20}>Resend Last Invoice</MenuItem>
                    <MenuItem value={30}>Resend Last Invoice</MenuItem>
                  </Select>
                </FormControl>
              </Typography>
              <Typography component="div" mt={2}>
                <Button variant="contained" startIcon={<MailOutlineIcon />}>
                  Send Email
                </Button>
              </Typography>
              <Box mt={2}>
                <TableContainer>
                  <Table sx={{ width: { lg: '100%', md: '100%', sm: '100%', xs: 'max-content' } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ px: "16px" }} align="left">
                          27/10/2020 | 12:23
                        </TableCell>
                        <TableCell align="left">Order Received</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ px: "16px" }} align="left">
                          11/05/2020 | 9:23
                        </TableCell>
                        <TableCell align="left">Order Confirmation</TableCell>
                      </TableRow>
                    </TableBody>

                  </Table>
                </TableContainer>
              </Box>
            </Typography>
          </Box>
        </MyStyledStack>
      </Grid>
      <Grid item lg={7} md={6} sm={12} xs={12}>
        <Box>
          <CustomerGraph userdata = {userdata}/>
          <Grid container mt={2} spacing={3} backgroundColor={"#fff"}>
            <Grid item lg={6} md={6} sm={6} xs={12}>
              <Box backgroundColor={"#ace2f8"} borderRadius={"5px 5px 0 0"} p={2}>
                <Typography variant="h6" sx={{ fontSize: { lg: '20px', md: '18px', sm: '18px', xs: '16px' } }}>Item favourites</Typography>
                <Typography component="div" mt={2} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                  <Typography component="div" fontSize={26} color={"#444444"}>{userdata?.wishlistCount}</Typography>
                  <Typography component="div" display={"flex"} alignItems={"center"} gap={"12px"}>
                    <Typography component="span" fontSize={22}>${userdata?.wishlistPrice}</Typography>
                    <Typography component="div">
                      <CustomerDataModal type="favourite" userdata = {userdata} />
                    </Typography>
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={12}>
              <Box backgroundColor={"#ace2f8"} borderRadius={"5px 5px 0 0"} p={2}>
                <Typography variant="h6" sx={{ fontSize: { lg: '20px', md: '18px', sm: '18px', xs: '16px' } }}>Shop follows</Typography>
                <Typography component="div" mt={2} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                  <Typography component="div" fontSize={26} color={"#444444"}>{userdata?.followCount}</Typography>
                  <Typography component="div" display={"flex"} alignItems={"center"} gap={"12px"}>
                    <Typography component="div">
                      <CustomerDataModal type="shop" userdata = {userdata} />
                    </Typography>
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={12}>
              <Box backgroundColor={"#ace2f8"} borderRadius={"5px 5px 0 0"} p={2}>
                <Typography variant="h6" sx={{ fontSize: { lg: '20px', md: '18px', sm: '18px', xs: '16px' } }}>Abandoned baskets</Typography>
                <Typography component="div" mt={2} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                  <Typography component="div" fontSize={26} color={"#444444"}>{userdata?.cartCount} items</Typography>
                  <Typography component="div" display={"flex"} alignItems={"center"} gap={"12px"}>
                    <Typography component="span" fontSize={22}>${userdata?.cartPrice}</Typography>
                    <Typography component="div">
                      <CustomerDataModal type="cart" userdata = {userdata} />
                    </Typography>
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={12}>
              <Box backgroundColor={"#ace2f8"} borderRadius={"5px 5px 0 0"} p={2}>
                <Typography variant="h6" sx={{ fontSize: { lg: '20px', md: '18px', sm: '18px', xs: '16px' } }}>Reviews</Typography>
                <Typography component="div" mt={2} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
                  <Typography component="div" fontSize={26} color={"#444444"}>{userdata.ratingCount}</Typography>
                  <Typography component="div" display={"flex"} alignItems={"center"} gap={"12px"}>
                    <Typography component="div">
                      <CustomerDataModal type="review" userdata = {userdata} />
                    </Typography>
                  </Typography>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <AdjustWalletBalance userdata={userdata} getUserById={getUserById}/>
          {/* <Box mt={3} p={1} backgroundColor={"#faf4f4"} borderRadius={"8px"}>
            <Box backgroundColor={"#fff"} boxShadow={"0 0 3px #d7d7d7"} borderRadius={"8px"} p={2}>
              <Typography component="div" display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                <Typography component="div" fontWeight={"600"} fontSize={20}>Payment Methods</Typography>
                <Typography component="div">
                  <Button sx={{ background: '#ededff', borderColor: 'transparent' }} startIcon={<AddBoxIcon sx={{ color: '#86afff' }} />}>
                    Add new method
                  </Button>
                </Typography>
              </Typography>
              <Box mt={2}>
                <TableContainer>
                  <Table sx={{ width: { lg: '100%', md: '100%', sm: '100%', xs: 'max-content' } }}>
                    <TableBody>
                      <TableRow sx={{ borderBottom: "1px dashed #ddd" }}>
                        <TableCell>
                          <Typography component="div" display={"flex"} alignItems={"center"} gap={"12px"}>
                            <ChevronRightIcon sx={{ color: '#808080' }} />
                            <Typography sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                                alt="Mastercard"
                                width="40"
                                height="25"
                              />
                              <div>
                                <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  Mastercard
                                  <Chip
                                    label="Primary"
                                    size="small"
                                    sx={{ borderRadius: '4px', backgroundColor: "#1c7cdb21", color: "#1976d2", fontSize: "12px", height: "20px", ml: 1 }}
                                  />
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Expires Dec 2024
                                </Typography>
                              </div>

                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography display={"flex"} gap={"12px"} alignItems={"center"} justifyContent={"end"}>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <EditIcon sx={{ color: 'gray' }} />
                            </Button>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <DeleteOutlineIcon sx={{ color: 'gray' }} />
                            </Button>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <TuneIcon sx={{ color: 'gray' }} />
                            </Button>
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ borderBottom: "1px dashed #ddd" }}>
                        <TableCell>
                          <Typography component="div" display={"flex"} alignItems={"center"} gap={"12px"}>
                            <ChevronRightIcon sx={{ color: '#808080' }} />
                            <Typography sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                                alt="Mastercard"
                                width="40"
                                height="25"
                              />
                              <div>
                                <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  Mastercard
                                  <Chip
                                    label="Primary"
                                    size="small"
                                    sx={{ borderRadius: '4px', backgroundColor: "#1c7cdb21", color: "#1976d2", fontSize: "12px", height: "20px", ml: 1 }}
                                  />
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Expires Dec 2024
                                </Typography>
                              </div>

                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography display={"flex"} gap={"12px"} alignItems={"center"} justifyContent={"end"}>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <EditIcon sx={{ color: 'gray' }} />
                            </Button>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <DeleteOutlineIcon sx={{ color: 'gray' }} />
                            </Button>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <TuneIcon sx={{ color: 'gray' }} />
                            </Button>
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ borderBottom: "1px dashed #ddd" }}>
                        <TableCell>
                          <Typography component="div" display={"flex"} alignItems={"center"} gap={"12px"}>
                            <ChevronRightIcon sx={{ color: '#808080' }} />
                            <Typography sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                                alt="Mastercard"
                                width="40"
                                height="25"
                              />
                              <div>
                                <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  Mastercard
                                  <Chip
                                    label="Expired"
                                    size="small"
                                    sx={{ borderRadius: '4px', backgroundColor: "#db1c4c21", color: "#d62e55", fontSize: "12px", height: "20px", ml: 1 }}
                                  />
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Expires Dec 2024
                                </Typography>
                              </div>

                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography display={"flex"} gap={"12px"} alignItems={"center"} justifyContent={"end"}>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <EditIcon sx={{ color: 'gray' }} />
                            </Button>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <DeleteOutlineIcon sx={{ color: 'gray' }} />
                            </Button>
                            <Button size="small" sx={{ minWidth: 'auto', '&:hover svg': { color: 'primary.main' } }}>
                              <TuneIcon sx={{ color: 'gray' }} />
                            </Button>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Box> */}
        </Box>
      </Grid>
      {/* <Grid item lg={4} md={6} sm={12} xs={12}>
        <MyStyledStack sx={{ boxShadow: 1 }}>
          <Typography
            sx={{
              p: "16px",
              fontWeight: "500",
              lineHeight: "1.5",
              fontSize: "16px"
            }}
          >
            Billing
          </Typography>
          <Divider />
          <TableContainer>
            <Table>
              <TableBody>
                {data2.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ px: "16px" }} align="left">
                      {row.key}
                    </TableCell>
                    <TableCell align="left">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack sx={{ my: "24px", justifyContent: "center" }} direction={"row"}>
            <Button
              sx={{
                color: "black",
                "&:hover": {
                  backgroundColor: "inherit", // Prevents background color change on hover
                  boxShadow: "none" // Prevents box-shadow on hover
                }
              }}
            >
              Create Invoice
            </Button>
            <Button
              sx={{
                color: "black",
                "&:hover": {
                  backgroundColor: "inherit", // Prevents background color change on hover
                  boxShadow: "none" // Prevents box-shadow on hover
                }
              }}
            >
              Resend Due Invoices
            </Button>
          </Stack>
        </MyStyledStack>
      </Grid>
      <Grid item lg={4} md={6} sm={12} xs={12}>
        <MyStyledStack sx={{ boxShadow: 1 }}>
          <Typography
            sx={{
              p: "16px",
              fontWeight: "500",
              lineHeight: "1.5",
              fontSize: "16px"
            }}
          >
            Send Email
          </Typography>
          <Divider sx={{ mb: "16px" }} />
          <Box style={{ paddingLeft: "16px", marginBottom: "16px", paddingRight: "16px" }}>
            <FormControl sx={{ width: 300, mb: "16px" }}>
              <Select
                multiple
                size={"small"}
                displayEmpty
                value={personName}
                onChange={handleChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return personName.length > 0 ? personName[0] : names[0];
                  }
                  return selected.join(", ");
                }}
                inputProps={{ "aria-label": "Without label" }}
              >
                {names.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<EmailIcon />}>
              Send Email
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableBody>
                {data3.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ px: "16px" }} align="left">
                      {row.key}
                    </TableCell>
                    <TableCell align="left">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MyStyledStack>
      </Grid>
      <Grid item lg={4} md={6} sm={12} xs={12}>
        <MyStyledStack sx={{ boxShadow: 1 }}>
          <Typography
            sx={{
              p: "16px",
              fontWeight: "500",
              lineHeight: "1.5",
              fontSize: "16px"
            }}
          >
            Other Actions
          </Typography>
          <Divider sx={{ mb: "16px" }} />
          <Box sx={{ pl: "16px", mb: "16px" }}>
            <Button sx={{ gap: "16px", color: "black" }} startIcon={<DoDisturbIcon />}>
              Close Account
            </Button>
          </Box>
          <Box sx={{ pl: "16px", mb: "16px" }}>
            <Button sx={{ gap: "16px", color: "black" }} startIcon={<DownloadIcon />}>
              Export Data
            </Button>
          </Box>
          <Stack direction="row" sx={{ mb: "16px", pl: "16px", gap: "8px", alignItems: "center" }}>
            <InfoIcon sx={{ color: "#FFAF38" }} />

            <Typography
              component={"small"}
              sx={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.5", color: "#91909E" }}
            >
              Once you delete account, data will be lost forever.
            </Typography>
          </Stack>
          <Box sx={{ ml: "16px" }}>
            <Button sx={{ mb: "32px" }} variant="contained" startIcon={<DeleteIcon />}>
              Delete Account
            </Button>
          </Box>
        </MyStyledStack>
      </Grid> */}
      <ConfirmModal open={open} handleClose={handleClose} handleStatusChange={handleStatusChange} type={type} msg={msg} />
      <MessagePopup
        openPopup={openPopup}
        userDetailForChat={userdata}
        handleClosePopup={handleClosePopup}
      />
    </Grid>
  );
};

export default Details;
