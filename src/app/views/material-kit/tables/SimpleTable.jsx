import {
  Box,
  Table,
  styled,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Avatar,
  Typography,
  Button,
} from "@mui/material";
import { useState } from "react";

// STYLED COMPONENT
const StyledTable = styled(Table)(({ theme }) => ({
  whiteSpace: "pre",
  "& thead": {
    "& tr": { "& th": { paddingLeft: 0, paddingRight: 0 } },
  },
  "& tbody": {
    "& tr": { "& td": { paddingLeft: 0, textTransform: "capitalize" } },
  },
}));

export default function SimpleTable({ topSellingProducts, productBaseUrl }) {
  const DEFAULT_VISIBLE = 5;
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE);

  const handleToggle = () => {
    const isExpanded = visibleCount >= topSellingProducts?.length;
    setVisibleCount(isExpanded ? DEFAULT_VISIBLE : topSellingProducts?.length || 0);
  };

  const isExpanded = visibleCount >= (topSellingProducts?.length || 0);

  return (
    <Box width="100%" overflow="auto">
      <StyledTable>
        <TableHead>
          <TableRow>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">SKU</TableCell>
            <TableCell align="center">Revenue</TableCell>
            <TableCell align="center">No. Of Orders</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            (topSellingProducts?.length > 0) ? (
              topSellingProducts.slice(0, visibleCount).map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      <Avatar
                        src={item?.image ? `${productBaseUrl}${item?.image}` : ""}
                        alt="product"
                        sx={{ width: 32, height: 32 }}
                      />
                      <Typography
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "180px",
                        }}
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
                <TableCell colSpan={3} align="center">
                  No Data Found
                </TableCell>
              </TableRow>
            )
          }
        </TableBody>
      </StyledTable>

      {/* Toggle Button */}
      {topSellingProducts?.length > DEFAULT_VISIBLE && (
        <Box textAlign="center" mt={2}>
          <Button variant="outlined" onClick={handleToggle}>
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
