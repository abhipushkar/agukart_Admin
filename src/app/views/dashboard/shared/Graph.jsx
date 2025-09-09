import React from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { useState } from "react";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { Box,MenuItem, Tab, Tabs, TextField, Typography } from "@mui/material";
import { dashboardDateRange } from "app/data/Index";
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const Graph = () => {
  const [date, setDate] = useState({
    range: "Today",
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0]
  });
  const [tab, setTab] = useState("visit");
  console.log({ tab }, "ghf");
  const [xAxisGraphData,setXAxisGraphData] = useState([]);
  const [yAxisGraphData, setYAxisGraphData] = useState([]);
  const [countGraphData,setCountGraphData] = useState({});
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const options = {
    title: "",
    chart: {
      type: "spline",
      backgroundColor: "rgba(0, 0, 0, 0)"
    },

    xAxis: {
      categories:xAxisGraphData,
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
        `${apiEndpoints.getGraphData}?startDate=${date?.from}&endDate=${date?.to}&type=${tab}`,
        auth_key
      );
      if (res?.data?.success) {
        console.log(res?.data, "fdtgfgfgfgfgfg");
        const startDate = dayjs(date?.from);
        const endDate = dayjs(date?.to);
        const diff = endDate.diff(startDate);
        const duration = dayjs.duration(diff);
        const days = duration.asDays();
        let xAxisGraphData = [];
        let yAxisGraphData = [];
        console.log(days,"fgjhtjhtjtjtjt")
        if(tab == "conversion rate"){
          if(days <= 1){
            xAxisGraphData = res?.data?.data?.map((item) => `${item?.hour} hr`);
            yAxisGraphData = res?.data?.data?.map((item) => item?.conversionRate);
          }else if(days <= 30){
            xAxisGraphData = res?.data?.data?.map((item) => `${item?.day} ${new Date(item?.year, item?.month - 1).toLocaleString('default', { month: 'long' })}`);
            yAxisGraphData = res?.data?.data?.map((item) => item?.conversionRate);
          }else{
            xAxisGraphData = res?.data?.data?.map((item) => `${new Date(item?.year, item?.month - 1).toLocaleString('default', { month: 'long' })} ${item?.year}`);
            yAxisGraphData = res?.data?.data?.map((item) => item?.conversionRate);
          }
        }else{
          if(days <= 1){
            xAxisGraphData = res?.data?.data?.map((item) => `${item?.hour} hr`);
            yAxisGraphData = res?.data?.data?.map((item) => item?.total);
          }else if(days <= 30){
            xAxisGraphData = res?.data?.data?.map((item) => `${item?.day} ${new Date(item?.year, item?.month - 1).toLocaleString('default', { month: 'long' })}`);
            yAxisGraphData = res?.data?.data?.map((item) => item?.total);
          }else{
            xAxisGraphData = res?.data?.data?.map((item) => `${new Date(item?.year, item?.month - 1).toLocaleString('default', { month: 'long' })} ${item?.year}`);
            yAxisGraphData = res?.data?.data?.map((item) => item?.total);
          }
        }
        setXAxisGraphData(xAxisGraphData || []);
        setYAxisGraphData(yAxisGraphData || []);
      } else {
        setYAxisGraphData([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getGraphData();
  }, [date,tab]);

  const getCountGraphData = async()=>{
    try {
      const res = await ApiService.get(
        `${apiEndpoints.getCountGraphData}?startDate=${date?.from}&endDate=${date?.to}`,
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
    getCountGraphData();
  },[date])

  return (
    <>
      <Box sx={{ width: "100%", backgroundColor: "#ffffff", p: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row"
            },
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 3
          }}
        >
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: "#000" } }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              flexGrow: 1,
              maxWidth: "100%",
            }}
          >
            <Tab
              value="visit"
              label={
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.25rem" color="text.primary">
                    Visit
                  </Typography>
                  <Typography variant="body2"  fontSize="1.1rem"  color="text.primary">
                    {countGraphData.visit}
                  </Typography>
                </Box>
              }
            />
            <Tab
              value="total orders"
              label={
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.25rem" color="text.primary">
                    Total Orders
                  </Typography>
                  <Typography variant="body2" fontSize="1.1rem" color="text.primary">
                    {countGraphData.totalOrder}
                  </Typography>
                </Box>
              }
            />
            <Tab
              value="unit orders"
              label={
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.25rem" color="text.primary">
                    Unit Orders
                  </Typography>
                  <Typography variant="body2" fontSize="1.1rem" color="text.primary">
                    {countGraphData.totalUnitOrders}
                  </Typography>
                </Box>
              }
            />
            <Tab
              value="conversion rate"
              label={
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" fontSize="1.25rem" color="text.primary">
                    Conversion Rate
                  </Typography>
                  <Typography variant="body2" fontSize="1.1rem" color="text.primary">
                    {countGraphData.conversionRate}
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
                    {countGraphData.totalRevenue}
                  </Typography>
                </Box>
              }
            />
          </Tabs>
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row"
              },
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap"
            }}
          >
            {date.range === "Custom Date Range" && (
              <>
                <TextField
                  type="date"
                  label="Start Date"
                  value={date.from}
                  onChange={(e) => setDate((prev) => ({ ...prev, from: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
                <TextField
                  type="date"
                  label="End Date"
                  value={date.to}
                  onChange={(e) => setDate((prev) => ({ ...prev, to: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </>
            )}
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
          </Box>
        </Box>

        {/* Title */}
        {/* <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: "500",
            textTransform: "capitalize",
            mb: 2,
            color: "#000"
          }}
        >
          Current Month Sales
        </Typography> */}

        {/* Chart */}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Box>
    </>
  );
};

export default Graph;
