import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { useEffect } from "react";
import { localStorageKey } from "app/constant/localStorageKey";
import styled from "@emotion/styled";
import { Box, Tab } from "@mui/material";
import { Breadcrumb } from "app/components";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Details from "./Details";
import { useState } from "react";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ConfirmModal from "app/components/ConfirmModal";
import SalesDetails from "./SalesDetails/SalesDetails";
import RecentActivity from "./RecentActivity";
const ViewCustomer = () => {
  const [userdata, setUserData] = useState({});
  const Container = styled("div")(({ theme }) => ({
    margin: "30px",
    [theme.breakpoints.down("sm")]: { margin: "16px" },
    "& .breadcrumb": {
      marginBottom: "30px",
      [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
    }
  }));

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  const query = useQuery();
  const paramValue = query.get("id");

  const auth_key = localStorage.getItem(localStorageKey.auth_key);
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

  const getUserById = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getUserById}/${paramValue}`, auth_key);
      if (res.status === 200) {
        setUserData(res?.data?.data);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    getUserById();
  }, [paramValue]);

  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: "Customers", path: "" }, { name: "View Customer" }]} />
      </Box>

      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Details" value="1" />
              <Tab label="Sales Details" value="2" />
              <Tab label="Recent Activity" value="3" />
            </TabList>
          </Box>
          <TabPanel sx={{ px: 0 }} value="1">
            <Details userdata={userdata} getUserById={getUserById} />
          </TabPanel>
          <TabPanel value="2">
            <SalesDetails userdata={userdata} />
          </TabPanel>
          <TabPanel value="3">
            <RecentActivity userdata={userdata}/>
          </TabPanel>
        </TabContext>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </Container>
  );
};

export default ViewCustomer;
