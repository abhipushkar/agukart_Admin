import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from "@mui/material";
import React from "react";

const GeneralShippingSettings = () => {
  const shippingData = [
    { label: "Address Name", value: "Abhishek Mittal" },
    {
      label: "Full Address",
      value: "Mittal Bhawan Chhoti Basti, Pushkar, Rajasthan, 305022, India"
    },
    { label: "Country Name", value: "India" },
    { label: "Time Zone", value: "(UTC+5:30) Asia/Kolkata" }
  ];
  return (
    <>
      <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom>
          Shipping Settings
        </Typography>

        <Paper elevation={3} sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Default Shipping Address
          </Typography>

          <TableContainer>
            <Table>
              <TableBody>
                {shippingData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: "bold", width: "30%" }}>{row.label}</TableCell>
                    <TableCell>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ textAlign: "right", marginTop: 2 }}>
            <Button variant="contained" color="primary">
              Edit
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default GeneralShippingSettings;
