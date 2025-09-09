import { Box, MenuItem, Stack, Tab, Tabs, Typography } from "@mui/material";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useState } from "react";
import { useEffect } from "react";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { dashboardDateRange } from "app/data/Index";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const CustomerGraph = ({ userdata }) => {
  const [xAxisGraphData,setXAxisGraphData] = useState([]);
  const [yAxisGraphData, setYAxisGraphData] = useState([]);
  const [countGraphData,setCountGraphData] = useState({});
  console.log({countGraphData})
  const [date, setDate] = useState({
    range: "Today",
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0]
  });
  const [tab, setTab] = useState("orders");
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const options = {
    title: "",
    chart: {
      type: "spline",
      backgroundColor: "rgba(0, 0, 0, 0)"
    },

    xAxis: {
      categories: xAxisGraphData,
      labels: {
        style: {
          color: "#bec5cc",
          fontSize: "14px",
          fontWeight: "500"
        }
      },
      lineColor: "rgba(255, 255, 255, 0.2)"
    },
    yAxis: {
      title: {
        text: ""
      },

      labels: {
        style: {
          color: "#bec5cc",
          fontSize: "14px",
          fontWeight: "500"
        }
      },
      gridLineColor: "rgba(255, 255, 255, 0.2)" // Grid line color to a lighter white
    },

    tooltip: {
      shared: true,
      crosshairs: true
    },
    series: [
      {
        name: "Data",
        data: yAxisGraphData,
        smooth: true,
        pointStart: 0,
        color: "#000"
      }
    ]
  };

  const handleDateRange = (option) => {
    const today = new Date();
    let fromDate = new Date();

    const returnDate = (range, dayAgo) => {
      fromDate.setDate(today.getDate() - dayAgo);
      return setDate({
        range: range,
        from: fromDate.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0]
      });
    };

    if (option === "Today") {
      returnDate("Today", 0);
    } else if (option === "Last day") {
      returnDate("Last day", 1);
    } else if (option === "Last 3 days") {
      returnDate("Last 3 days", 3);
    } else if (option === "Last 7 days") {
      returnDate("Last 7 days", 7);
    } else if (option === "Last 14 days") {
      returnDate("Last 14 days", 14);
    } else if (option === "Last 30 days") {
      returnDate("Last 30 days", 30);
    } else if (option === "Last 90 days") {
      returnDate("Last 90 days", 90);
    } else if (option === "Last 180 days") {
      returnDate("Last 180 days", 180);
    } else if (option === "Last 365 days") {
      returnDate("Last 365 days", 365);
    } else {
      setDate((prev) => ({
        range: option
      }));
    }
  };
  const getGraphData = async () => {
    try {
      const res = await ApiService.get(
        `${apiEndpoints.getCustomerGraphData}?type=${tab}&startDate=${date?.from}&endDate=${date?.to}&user_id=${userdata?._id}`,
        auth_key
      );

      if (res.status === 200 && Array.isArray(res?.data?.data)) {
        const graphData = res.data.data;
        const startDate = dayjs(date?.from);
        const endDate = dayjs(date?.to);
        const diff = endDate.diff(startDate);
        const duration = dayjs.duration(diff);
        const days = duration.asDays();

        let xAxisGraphData = [];
        let yAxisGraphData = [];

        if (days <= 1) {
          xAxisGraphData = graphData?.map((item) => `${item?.hour} hr`);
        } else if(days <= 30){
          xAxisGraphData = res?.data?.data?.map((item) => `${item?.day} ${new Date(item?.year, item?.month - 1).toLocaleString('default', { month: 'long' })}`);
        }else{
          xAxisGraphData = res?.data?.data?.map((item) => `${new Date(item?.year, item?.month - 1).toLocaleString('default', { month: 'long' })} ${item?.year}`);
        }
        if(tab == "orders"){
          yAxisGraphData = graphData.map((item) => item?.totalOrders);
        }else{
          yAxisGraphData = graphData.map((item) => item?.totalRevenue);
        }

        setXAxisGraphData(xAxisGraphData);
        setYAxisGraphData(yAxisGraphData);
      } else {
        setXAxisGraphData([]);
        setYAxisGraphData([]);
      }
    } catch (error) {
      console.error("Error fetching graph data:", error);
      setXAxisGraphData([]);
      setYAxisGraphData([]);
    }
  };


  useEffect(() => {
    if (userdata?._id) {
      getGraphData();
    }
  }, [userdata,date,tab]);

  const getCountGraphData = async()=>{
    try {
      const res = await ApiService.get(
        `${apiEndpoints.getCustomerCountGraphData}?startDate=${date?.from}&endDate=${date?.to}&user_id=${userdata?._id}`,
        auth_key
      );
      if (res?.data?.success) {
        setCountGraphData(res?.data?.data)
      } else {
        setCountGraphData({});
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(()=>{
    if(userdata?._id){
      getCountGraphData();
    }
  },[date,userdata])
  return (
    <>
      <Stack direction="column" spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: "#000" } }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flexGrow: 1, minWidth: 200 }}
          >
            <Tab
              value="orders"
              label={
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.25rem" color="text.primary">
                    Orders
                  </Typography>
                  <Typography variant="body2" fontSize="1.1rem" color="text.primary">
                    {countGraphData?.totalOrders}
                  </Typography>
                </Box>
              }
            />
            <Tab
              value="revenue"
              label={
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.25rem" color="text.primary">
                    Revenue
                  </Typography>
                  <Typography variant="body2" fontSize="1.1rem" color="text.primary">
                    {countGraphData?.revenue}
                  </Typography>
                </Box>
              }
            />
          </Tabs>

          <TextField
            select
            label="Date Range"
            value={date.range}
            onChange={(e) => handleDateRange(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            {dashboardDateRange.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {date.range === "Custom Date Range" && (
            <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
              <TextField
                type="date"
                label="Start"
                value={date.from}
                onChange={(e) => setDate((prev) => ({ ...prev, from: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="date"
                label="End"
                value={date.to}
                onChange={(e) => setDate((prev) => ({ ...prev, to: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Box>
          )}
        </Box>
        {/* Graph Below Date */}
        <Box sx={{ backgroundColor: "#ffffff", p: 3, borderRadius: "8px" }}>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 500,
              textTransform: "capitalize",
              mb: 1,
              color: "#000"
            }}
          >
            Last 12 Months Sales
          </Typography>
          <HighchartsReact highcharts={Highcharts} options={options} />
        </Box>
      </Stack>
    </>
  );
};

export default CustomerGraph;
