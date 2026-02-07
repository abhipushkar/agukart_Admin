import {
  Box,
  Grid,
  Typography
} from "@mui/material";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import GeneralShippingSettings from "./GeneralShippingSettings/GeneralShippingSettings";
import ShippingTemplates from "./ShippingTemplates/ShippingTemplates";
import { useEffect } from "react";

const ShippingSettings = () => {
  const [query] = useSearchParams();
  const queryId = query.get("id");
  const [tab, setTab] = useState("general shipping settings");

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  useEffect(() => {
    if (queryId) {
      setTab("shipping templates");
    } else {
      setTab("general shipping settings");
    }
  }, [queryId]);
  return (
    <>
      <Box sx={{ padding: "30px", background: "#fff" }}>
        <Grid container width={"100%"} m={0} spacing={2} alignItems={"center"}>
          <Grid lg={6} md={6} xs={6}>
            <Typography variant="h5" fontWeight={600}>
              Shipping Settings
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
                    <Tab label="General Shipping Settings" value="general shipping settings" />
                    <Tab label="Shipping Templates" value="shipping templates" />
                  </TabList>
                </Box>
                <TabPanel value={tab} sx={{ padding: "24px 0" }}></TabPanel>
              </TabContext>
            </Box>
          </Grid>
        </Grid>
        <Box>
          {tab === "general shipping settings" && (
            <GeneralShippingSettings />
          )}
          {tab === "shipping templates" && (
            <ShippingTemplates queryId={queryId} />
          )}
        </Box>
      </Box>
    </>
  );
};

export default ShippingSettings;
