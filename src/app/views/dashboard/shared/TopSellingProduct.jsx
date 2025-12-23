import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { dashboardDateRange } from "app/data/Index";
import { REACT_APP_WEB_URL } from "config";

const LIMIT = 5;

const TopSellingProduct = () => {
  const [date, setDate] = useState({
    range: "Today",
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0]
  });

  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [productBaseUrl, setProductBaseUrl] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleDateRange = (option) => {
    const today = new Date();
    let fromDate = new Date();

    const returnDate = (range, dayAgo) => {
      fromDate.setDate(today.getDate() - dayAgo);
      setDate({
        range: range,
        from: fromDate.toISOString().split("T")[0],
        to: today.toISOString().split("T")[0]
      });
    };

    switch (option) {
      case "Today": returnDate("Today", 0); break;
      case "Last day": returnDate("Last day", 1); break;
      case "Last 3 days": returnDate("Last 3 days", 3); break;
      case "Last 7 days": returnDate("Last 7 days", 7); break;
      case "Last 14 days": returnDate("Last 14 days", 14); break;
      case "Last 30 days": returnDate("Last 30 days", 30); break;
      case "Last 90 days": returnDate("Last 90 days", 90); break;
      case "Last 180 days": returnDate("Last 180 days", 180); break;
      case "Last 365 days": returnDate("Last 365 days", 365); break;
      default: setDate((prev) => ({ ...prev, range: option })); break;
    }
  };

  const getTopSellingProducts = async (currentPage = 1, reset = false) => {
    try {
      setLoading(true);
      const res = await ApiService.get(
        `${apiEndpoints.getTopSellingProducts}?startDate=${date.from}&endDate=${date.to}&limit=${LIMIT}&page=${currentPage}`,
        auth_key
      );

      if (res?.data?.success) {
        const newData = res?.data?.data || [];

        if (reset) {
          setTopSellingProducts(newData);
        } else {
          setTopSellingProducts((prev) => [...prev, ...newData]);
        }

        setProductBaseUrl(res?.data?.productBaseUrl);
        setHasMore(newData.length === LIMIT); // More data available
      } else {
        setTopSellingProducts([]);
        setHasMore(false);
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // on date change, reset page and data
  useEffect(() => {
    setPage(1);
    getTopSellingProducts(1, true);
  }, [date]);

  const handleShowMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    getTopSellingProducts(nextPage);
  };

  return (
    <Stack sx={{ bgcolor: "white", p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Typography sx={{ fontWeight: "500", fontSize: "1rem" }}>
          Top Selling Products
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
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
      </Stack>

      <Box width="100%" overflow="auto" mt={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">SKU</TableCell>
              <TableCell align="center">Revenue</TableCell>
              <TableCell align="center">No. Of Orders</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topSellingProducts.length > 0 ? (
              topSellingProducts.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={item?.image ? `${productBaseUrl}${item?.image}` : ""}
                        alt="product"
                        sx={{ width: 70, height: 70 }}
                      />
                      <Typography
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "180px",
                          cursor: "pointer",
                          textDecoration: "underline"
                        }}
                        onClick={() => {
                          const url = `${REACT_APP_WEB_URL}/products/${item?._id}`;
                          window.open(url, "_blank", "noopener,noreferrer");
                        }
                        }
                      >
                        {item?.name?.replace(/<\/?[^>]+(>|$)/g, "")}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{item?.skucode}</TableCell>
                  <TableCell align="center">{item?.totalRevenue}</TableCell>
                  <TableCell align="center">{item?.totalQtySold}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">No Data Found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {topSellingProducts?.length > 0 && hasMore && (
          <Box textAlign="center" mt={2}>
            <Button disabled={loading} startIcon={loading && <CircularProgress size={20} />} variant="outlined" onClick={handleShowMore}>
              Show More
            </Button>
          </Box>
        )}
      </Box>
    </Stack>
  );
};

export default TopSellingProduct;
