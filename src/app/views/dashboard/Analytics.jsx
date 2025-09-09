import ReactECharts from "echarts-for-react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { green, red } from "@mui/material/colors";
import AppTable from "../material-kit/tables/AppTable";
import GroupIcon from "@mui/icons-material/Group";
import MaxHeightMenu from "../material-kit/menu/MaxHeightMenu";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import SimpleTable from "../material-kit/tables/SimpleTable";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useState } from "react";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { Link } from "react-router-dom";
import RecentActivity from "./shared/RecentActivity";
import Graph from "./shared/Graph";
import TopSellingProduct from "./shared/TopSellingProduct";
import TotalBreakDown from "./shared/TotalBreakDown";
import ProductActivity from "./shared/ProductActivity";

export default function Analytics() {
  const designation_id = localStorage.getItem(localStorageKey.designation_id);

  const option2 = {
    tooltip: {
      trigger: "item"
    },
    color: ["#125AA1", "#1A80E6", "#4E9FF0"],
    legend: {
      top: "5%",
      left: "center"
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center"
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold"
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 65, name: "Google" },
          { value: 20, name: "Facebook" },
          { value: 15, name: "Other" }
        ]
      }
    ]
  };
  const option3 = {
    dataset: {
      source: [
        ["score", "amount", "product"],
        [19.6, 91852, "Twitter"],
        [10.6, 101852, "Tensor"],
        [32.7, 20112, "Google"]
      ]
    },
    grid: { containLabel: true },
    xAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: "category",
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false }
    },
    series: [
      {
        type: "bar",
        encode: {
          x: "amount", // Map the "amount" column to X axis.
          y: "product" // Map the "product" column to Y axis.
        },
        barWidth: 10, // Make the bars thinner
        barGap: "10%", // Reduce the gap between bars
        barCategoryGap: "20%", // Reduce the gap between categories
        itemStyle: {
          borderRadius: [0, 20, 20, 0] // Rounded corners at the right side (end)
        },
        label: {
          show: true,
          position: "right",
          formatter: "{b}"
        },
        // Define different colors for each bar
        itemStyle: {
          color: function (params) {
            const colorList = ["#125AA1", "#1A80E6", "#4E9FF0"];
            return colorList[params.dataIndex % colorList.length];
          },
          borderRadius: [0, 20, 20, 0] // Ensure this is set here to apply rounded corners
        }
      }
    ]
  };
  return (
    <>
      <Graph/>
      <Container sx={{ mb: 3, position: "relative", top: "-60px" }} maxWidth="100%">
        <Grid container spacing={2}>
          <Grid container item spacing={2} md={12} sm={12} xs={12} lg={8}>
            {/* <Grid item md={12} lg={6} sm={12} xs={12}>
              <Box
                sx={{
                  boxShadow: 2,
                  p: 3,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#ffff"
                }}
              >
                <Stack direction={"row"} alignItems={"center"} gap={2}>
                  <Box>
                    <GroupIcon color="primary" style={{ fontSize: 40 }} />
                  </Box>
                  <Box>
                    <Typography fontSize={"12px"} color={"gray"}>
                      New Leads
                    </Typography>
                    <Typography color="primary" fontSize="14px" variant="h6">
                      3050
                    </Typography>
                  </Box>
                </Stack>
                <Box>
                  <ArrowRightAltIcon sx={{ color: "gray" }} fontSize="large" />
                </Box>
              </Box>
            </Grid>
            <Grid item md={12} lg={6} sm={12} xs={12}>
              <Box
                sx={{
                  boxShadow: 2,
                  p: 3,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#ffff"
                }}
              >
                <Stack direction={"row"} alignItems={"center"} gap={2}>
                  <Box>
                    <GroupIcon color="primary" style={{ fontSize: 40 }} />
                  </Box>
                  <Box>
                    <Typography fontSize={"12px"} color={"gray"}>
                      New Leads
                    </Typography>
                    <Typography color="primary" fontSize="14px" variant="h6">
                      3050
                    </Typography>
                  </Box>
                </Stack>
                <Box>
                  <ArrowRightAltIcon sx={{ color: "gray" }} fontSize="large" />
                </Box>
              </Box>
            </Grid>
            <Grid item md={12} lg={6} sm={12} xs={12}>
              <Box
                sx={{
                  boxShadow: 2,
                  p: 3,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#ffff"
                }}
              >
                <Stack direction={"row"} alignItems={"center"} gap={2}>
                  <Box>
                    <GroupIcon color="primary" style={{ fontSize: 40 }} />
                  </Box>
                  <Box>
                    <Typography fontSize={"12px"} color={"gray"}>
                      New Leads
                    </Typography>
                    <Typography color="primary" fontSize="14px" variant="h6">
                      3050
                    </Typography>
                  </Box>
                </Stack>
                <Box>
                  <ArrowRightAltIcon sx={{ color: "gray" }} fontSize="large" />
                </Box>
              </Box>
            </Grid>
            <Grid item md={12} lg={6} sm={12} xs={12}>
              <Box
                sx={{
                  boxShadow: 2,
                  p: 3,
                  borderRadius: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#ffff"
                }}
              >
                <Stack direction={"row"} alignItems={"center"} gap={2}>
                  <Box>
                    <GroupIcon color="primary" style={{ fontSize: 40 }} />
                  </Box>
                  <Box>
                    <Typography fontSize={"12px"} color={"gray"}>
                      New Leads
                    </Typography>
                    <Typography color="primary" fontSize="14px" variant="h6">
                      3050
                    </Typography>
                  </Box>
                </Stack>
                <Box>
                  <ArrowRightAltIcon sx={{ color: "gray" }} fontSize="large" />
                </Box>
              </Box>
            </Grid> */}

            <Grid item sm={12} xs={12} lg={12}>
              <TopSellingProduct/>
            </Grid>
            {/* <Grid item md={12} sm={12} xs={12} lg={6}>
              <Box
                sx={{
                  boxShadow: 2,
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  backgroundColor: "white"
                }}
              >
                <Stack direction={"row"} alignItems={"center"} gap={1}>
                  <Box
                    backgroundColor={green[50]}
                    sx={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "50%"
                    }}
                  >
                    <TrendingUpIcon sx={{ color: "#4caf50" }} />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: "500", fontSize: "16px", color: "#4caf50" }}
                  >
                    Active Users
                  </Typography>
                </Stack>
                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                  <Typography
                    variant="h1"
                    sx={{ fontSize: "28px", fontWeight: "600", color: "gray" }}
                  >
                    10.8k
                  </Typography>
                  <Typography sx={{ color: "#4caf50" }}>(+21%)</Typography>
                </Stack>
              </Box>
            </Grid> */}
            {/* <Grid item md={12} sm={12} xs={12} lg={6}>
              <Box
                sx={{
                  boxShadow: 2,
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  backgroundColor: "white"
                }}
              >
                <Stack direction={"row"} alignItems={"center"} gap={1}>
                  <Box
                    backgroundColor={red[50]}
                    sx={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "50%"
                    }}
                  >
                    <StarBorderIcon sx={{ color: "#f44336" }} />
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: "500", fontSize: "16px", color: "#f44336" }}
                  >
                    Transactions
                  </Typography>
                </Stack>
                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                  <Typography
                    variant="h1"
                    sx={{ fontSize: "28px", fontWeight: "600", color: "gray" }}
                  >
                    $2.8M
                  </Typography>
                  <Typography sx={{ color: "#f44336" }}>(+21%)</Typography>
                </Stack>
              </Box>
            </Grid> */}

            {/* <Grid item sm={12} xs={12} lg={12} md={12}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: "500",
                    fontSize: "1rem"
                  }}
                >
                  Ongoing Projects
                </Typography>
                <Stack gap={2} direction={"column"}>
                  <Stack
                    sx={{ boxShadow: 2, borderRadius: 2, bgColor: "white", py: 1 }}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    width={"100%"}
                    direction={"row"}
                  >
                    <Checkbox value="checkedA" inputProps={{ "aria-label": "primary checkbox" }} />

                    <Avatar>N</Avatar>
                    <Typography>Project 1</Typography>
                    <Typography>05/27/2024 12:40PM</Typography>

                    <AvatarGroup max={4}>
                      <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                      <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                      <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                      <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                      <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
                    </AvatarGroup>
                    <MaxHeightMenu />
                  </Stack>
                </Stack>
                <Stack gap={2} direction={"column"}>
                  <Stack
                    sx={{ boxShadow: 2, borderRadius: 2, bgColor: "white", py: 1 }}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    width={"100%"}
                    direction={"row"}
                  >
                    <Checkbox value="checkedA" inputProps={{ "aria-label": "primary checkbox" }} />

                    <Avatar>N</Avatar>
                    <Typography>Project 1</Typography>
                    <Typography>05/27/2024 12:40PM</Typography>

                    <AvatarGroup max={4}>
                      <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                      <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                      <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                      <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                      <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
                    </AvatarGroup>
                    <MaxHeightMenu />
                  </Stack>
                </Stack>
                <Stack gap={2} direction={"column"}>
                  <Stack
                    sx={{ boxShadow: 2, borderRadius: 2, bgColor: "white", py: 1 }}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    width={"100%"}
                    direction={"row"}
                  >
                    <Checkbox value="checkedA" inputProps={{ "aria-label": "primary checkbox" }} />

                    <Avatar>N</Avatar>
                    <Typography>Project 1</Typography>
                    <Typography>05/27/2024 12:40PM</Typography>

                    <AvatarGroup max={4}>
                      <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                      <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
                      <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
                      <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
                      <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
                    </AvatarGroup>
                    <MaxHeightMenu />
                  </Stack>
                </Stack>
              </Box>
            </Grid> */}
          </Grid>

          <Grid container item spacing={2} md={12} lg={4}>
            {/* <Grid item lg={12} md={6} sm={12} xs={12}>
              <Box sx={{ boxShadow: 2, borderRadius: 2, backgroundColor: "#ffff" }}>
                <Typography
                  sx={{
                    fontWeight: "500",
                    fontSize: "1rem",
                    pl: 2,
                    pt: 2
                  }}
                >
                  Traffic SourcesLast 30 days
                </Typography>
                <ReactECharts option={option2} />
              </Box>
            </Grid> */}
            {/* <Grid item lg={12} md={6} sm={12} xs={12}>
              <Box sx={{ boxShadow: 2, borderRadius: 2, backgroundColor: "#ffff" }}>
                <Typography
                  sx={{
                    fontWeight: "500",
                    fontSize: "1rem",
                    pl: 2,
                    pt: 2
                  }}
                >
                  Campaigns
                </Typography>
                <ReactECharts option={option3} />
              </Box>
            </Grid> */}
            <Grid item lg={12} md={6} sm={12} xs={12}>
              <TotalBreakDown/>
            </Grid>
          </Grid>
        </Grid>
        {
          designation_id == "2" && <>
            <RecentActivity/>
          </>
        }
        <ProductActivity/>
      </Container>
    </>
  );
}
