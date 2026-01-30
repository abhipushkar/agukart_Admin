import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
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
import ConfirmModal from "app/components/ConfirmModal";
import ReviewDialog from "../reviews/ReviewModal";
import EditIcon from '@mui/icons-material/Edit';
import { useCallback } from "react";

const AffiliateUsers = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [tab, setTab] = useState("pending");
  const [open1, setOpen1] = React.useState(false);
  const [users, setUsers] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(0);
  const [rejectRemark, setRejectRemark] = useState("");
  const [affiliateCommision, setAffiliateCommision] = useState("");
  const [type1, setType1] = useState("");
  const [id, setId] = useState("");
  const [addCmnt, setAddCmnt] = useState("");
  const handleOpen1 = (type, id, cmnt) => {
    setOpen1(true);
    setType1(type);
    setId(id);
    setAddCmnt(cmnt);
  };
  const handleClose1 = () => {
    setOpen1(false);
    setType1("");
    setId("");
    setAddCmnt("");
    setRejectRemark("");
    setAffiliateCommision("");
  };
  const navigate = useNavigate();

  //   console.log({ reviewIds });

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

  const handleOpen = useCallback((type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut();
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (route !== null) {
      navigate(route);
    }
    setRoute(null);
    setMsg(null);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setId("");
    setAddCmnt("");
    setType1("");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getAffiliateUsers = useCallback(async () => {
    try {
      setUsers([]);
      const res = await ApiService.get(`${apiEndpoints.getAffiliateUsers}/${tab}`, auth_key);
      console.log(res?.data?.users);
      setUsers(res?.data?.users);
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key, handleOpen, tab]);

  const changeUserStatus = async () => {
    try {
      let payload = {
        status: type1,
        reject_remark: rejectRemark,
        _id: id,
        affiliate_commission: 0
      };
      if (type1 === "approved") {
        payload.affiliate_commission = affiliateCommision
      }
      const res = await ApiService.post(apiEndpoints.changeAffiliateUserStatus, payload, auth_key);
      if (res?.status === 200) {
        getAffiliateUsers();
        handleClose1();
        setRejectRemark("");
        setAffiliateCommision("");
        setId("");
        setAddCmnt("");
        setType1("");
        handleOpen("success", res?.data);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    getAffiliateUsers();
  }, [getAffiliateUsers, tab]);

  const capitalizeFirstWord = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <>
      <Box sx={{ padding: "30px", background: "#fff" }}>
        <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
          <Grid lg={6} md={6} xs={6}>
            <Typography variant="h5" fontWeight={600}>
              Affiliate Users
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
                    <Tab label="Pending" value="pending" />
                    <Tab label="Approved" value="approved" />
                    <Tab label="Rejected" value="rejected" />
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
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile No.</TableCell>
                  {
                    tab === "approved" && (
                      <TableCell>Affiliate Commission(In %)</TableCell>
                    )
                  }
                  <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              {users?.length > 0 ? (
                <TableBody>
                  {users.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{capitalizeFirstWord(item?.name)}</TableCell>
                      <TableCell>{item?.email}</TableCell>
                      <TableCell>{item?.phone}</TableCell>
                      {
                        tab === "approved" && (
                          <TableCell>{item?.affiliate_commission}</TableCell>
                        )
                      }
                      <TableCell>
                        <Box
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"space-evenly"}
                          width={"320px"}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() =>
                              navigate(`${ROUTE_CONSTANT.affiliateUser.users.edit}?id=${item._id}`)
                            }
                          >
                            Edit
                          </Button>
                          {tab === "pending" && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() =>
                                  handleOpen1("approved", item?._id, item?.additional_comment)
                                }
                                style={{ marginLeft: "10px" }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() =>
                                  handleOpen1("rejected", item?._id, item?.additional_comment)
                                }
                                style={{ marginLeft: "10px" }}
                              >
                                Reject
                              </Button>
                            </>)
                          }
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody scope="row">
                  <TableCell colSpan={tab === "pending" ? 5 : 4} sx={{ textAlign: "center" }}>
                    No Affiliate Users Found
                  </TableCell>
                </TableBody>
              )}
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[25, 50, 75, 100]}
            component="div"
            count={users?.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
        <ReviewDialog
          open1={open1}
          handleOpen1={handleOpen1}
          handleClose1={handleClose1}
          rejectRemark={rejectRemark}
          setRejectRemark={setRejectRemark}
          affiliateCommision={affiliateCommision}
          setAffiliateCommision={setAffiliateCommision}
          type1={type1}
          addCmnt={addCmnt}
          changeReviewStatus={changeUserStatus}
        />
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default AffiliateUsers;
