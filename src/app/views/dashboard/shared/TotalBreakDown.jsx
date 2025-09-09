import { Box, Divider, List, ListItem, MenuItem, TextField, Typography } from "@mui/material";
import { localStorageKey } from "app/constant/localStorageKey";
import React from "react";
import { useState } from "react";
import { dashboardDateRange } from "app/data/Index";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";

const TotalBreakDown = () => {
  const [date, setDate] = useState({
    range: "Today",
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0]
  });
  const [dashboardData, setDashboardData] = useState([]);
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

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
  const getDashboardData = async () => {
    try {
      const res = await ApiService.get(
        `${apiEndpoints.getDashboardData}?startDate=${date.from}&endDate=${date.to}`,
        auth_key
      );
      if (res?.data?.success) {
        setDashboardData(res?.data?.data);
      } else {
        setDashboardData([]);
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getDashboardData();
  }, [date]);
  return (
    <>
      <Box sx={{ boxShadow: 2, borderRadius: 2, backgroundColor: "#ffff", padding: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Total breakdown
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: {
                xs: "flex-start",
                sm: "flex-end"
              },
              gap: 2,
              width: "100%"
            }}
          >
            <TextField
              select
              value={date.range}
              label="Date Range"
              onChange={(e) => handleDateRange(e.target.value)}
              sx={{
                ".MuiInputBase-root": {
                  height: "36px"
                }
              }}
            >
              {dashboardDateRange.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {date.range === "Custom Date Range" && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: {
                    xs: "column",
                    sm: "row"
                  },
                  gap: 2,
                  width: "100%"
                }}
              >
                <TextField
                  type="date"
                  label="Start Date"
                  value={date.from}
                  onChange={(e) => setDate((prev) => ({ ...prev, from: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: 200,
                    ".MuiInputBase-root": {
                      height: "36px"
                    }
                  }}
                />
                <TextField
                  type="date"
                  label="End Date"
                  value={date.to}
                  onChange={(e) => setDate((prev) => ({ ...prev, to: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    width: 200,
                    ".MuiInputBase-root": {
                      height: "36px"
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
        <Divider />
        <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #eee">
          <Typography variant="body2">Users</Typography>
          <Typography variant="body2" fontWeight="bold">
            {dashboardData?.userCount}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #eee">
          <Typography variant="body2">Shop Followers</Typography>
          <Typography variant="body2" fontWeight="bold">
            {dashboardData?.shopFollowCount}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #eee">
          <Typography variant="body2">Item Favourites</Typography>
          <Typography variant="body2" fontWeight="bold">
            {dashboardData?.shopFavoriteCount}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid #eee">
          <Typography variant="body2">Review</Typography>
          <Typography variant="body2" fontWeight="bold">
            {dashboardData?.reviewCount}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" py={1}>
          <Typography variant="body2">Views</Typography>
          <Typography variant="body2" fontWeight="bold">
            {dashboardData?.visitCount}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" py={1}>
          <Typography variant="body2">Affiliate Users</Typography>
          <Typography variant="body2" fontWeight="bold">
            {dashboardData?.affiliateCount}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default TotalBreakDown;
