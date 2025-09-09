import { Breadcrumb } from "app/components";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  FormControl,
  TextareaAutosize,
  Paper
} from "@mui/material";
import React from "react";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { REACT_APP_WEB_URL } from "config";

const ViewShopReport = () => {
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");
  const [shopBaseUrl, setShopBaseUrl] = useState("");
  const [reportData, setReportData] = useState({});
  console.log({ reportData });
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const getProductReport = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getSingleReport}/${queryId}`, auth_key);

      if (res.status === 200) {
        setReportData(res?.data?.report);
        setShopBaseUrl(res?.data?.shopBaseUrl || "");
      }
    } catch (error) {
      // handleOpen("error", error?.response?.data || error);
      console.log(error);
    }
  };

  useEffect(() => {
    getProductReport();
  }, []);

  const DetailItem = ({ label, value }) => (
    <Grid item xs={12} sm={12} md={12}>
      <Typography variant="body2" color="textSecondary">
        <strong>{label}:</strong> {value}
      </Typography>
    </Grid>
  );

  function formatDateTimeToDDMMYYYY(dateInput) {
    const date = new Date(dateInput);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  }
  return (
    <Box sx={{ margin: "30px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 2
        }}
        className="breadcrumb"
      >
        <Breadcrumb
          routeSegments={[
            { name: "Report", path: "" },
            { name: "Shop Report", path: `${ROUTE_CONSTANT.report.shopReport}` },
            { name: "View Shop Report" }
          ]}
        />
      </Box>
      <Box p={3}>
        <Card elevation={3}>
          <CardContent>
            {reportData?.type == "ip" ? (
              <>
                <Box>
                  <Typography
                    variant="p"
                    color="black"
                    sx={{ fontWeight: "bold", fontSize: "20px" }}
                  >
                    IP Infingerprint Report
                  </Typography>
                </Box>
                <Box
                  sx={{
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: "40px" }}>
                    <Typography variant="div">
                      Report Id : <Typography variant="span">{reportData?.report_id}</Typography>
                    </Typography>
                    <Typography variant="div">
                      Date :{" "}
                      <Typography variant="span">
                        {formatDateTimeToDDMMYYYY(reportData?.createdAt || "")}
                      </Typography>
                    </Typography>
                  </Box>
                  <FormControl sx={{ minWidth: 200 }}>
                    {/* <InputLabel id="dropdown-label">Choose Option</InputLabel>
                     <Select
                       labelId="dropdown-label"
                       value={value}
                       label="Choose Option"
                       onChange={(e) => setValue(e.target.value)}
                     >
                       <MenuItem value="option1">Option 1</MenuItem>
                       <MenuItem value="option2">Option 2</MenuItem>
                       <MenuItem value="option3">Option 3</MenuItem>
                     </Select> */}
                    {reportData?.status || "pending"}
                  </FormControl>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#dfdada",
                    fontSize: "20px",
                    padding: "8px",
                    marginTop: "8px",
                    fontWeight: "bold"
                  }}
                >
                  Reporter Details
                </Box>
                <Box sx={{ columnCount: 2, columnGap: 2, marginTop: "6px" }}>
                  <div style={{ marginBottom: "6px" }}>
                    Name :{" "}
                    <Typography variant="span">
                      {reportData?.firstName} {reportData?.lastName}
                    </Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Country : <Typography variant="span">{reportData?.country}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Email : <Typography variant="span">{reportData?.email}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Mobile : <Typography variant="span">{reportData?.phone}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    City : <Typography variant="span">{reportData?.city}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Company Name : <Typography variant="span">{reportData?.companyName}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Zip Code : <Typography variant="span">{reportData?.zipCode}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Job Title : <Typography variant="span">{reportData?.jobTitle}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Address : <Typography variant="span">{reportData?.address} </Typography>
                  </div>
                </Box>
                <Box
                  sx={{
                    backgroundColor: "#dfdada",
                    fontSize: "20px",
                    padding: "8px",
                    marginTop: "8px",
                    fontWeight: "bold"
                  }}
                >
                  {" "}
                  Infringing Shop Details
                </Box>
                <Grid container spacing={3} sx={{ marginTop: "6px" }}>
                  <Grid item xs={12} md={8}>
                    <div style={{ marginBottom: "6px" }}>
                      Shop ID :{" "}
                      <Typography variant="span">{reportData?.storedata?._id}</Typography>
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                      Shop Name :{" "}
                      <Typography variant="span">
                        {reportData?.storedata?.shop_name}
                      </Typography>
                    </div>
                    <div style={{ marginBottom: "6px" }}>
                      Shop URL :{" "}
                      <Typography variant="span">{`${REACT_APP_WEB_URL}/store/${reportData?.storedata?.slug}`}</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography sx={{ textAlign: "center" }}>Shop Image</Typography>
                    <div style={{ width: "300px" }}>
                      <img
                        src={`${shopBaseUrl}${reportData?.storedata?.shop_icon}`}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    backgroundColor: "#dfdada",
                    fontSize: "20px",
                    padding: "8px",
                    marginTop: "8px",
                    fontWeight: "bold"
                  }}
                ></Box>
                <Box sx={{ marginTop: "6px" }}>
                  <div style={{ marginBottom: "6px" }}>
                    Ownership Declaration :{" "}
                    <Typography variant="span">{reportData?.ownershipDeclaration}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Intellectual Property Type :{" "}
                    <Typography variant="span">{reportData?.ipType}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Owns the intellectual property :{" "}
                    <Typography variant="span">{reportData?.ipOwner}</Typography>
                  </div>
                  <div style={{ marginBottom: "6px" }}>
                    Educational resources for the intellectual property avaliable online URL :{" "}
                    <Typography variant="span">{reportData?.educationalUrl}</Typography>
                  </div>
                  {reportData?.ipType == "Copyright" && (
                    <>
                      {reportData?.ipData?.map((item, index) => (
                        <Paper
                          key={index}
                          elevation={3}
                          sx={{
                            padding: 2,
                            marginBottom: 3,
                            borderRadius: 2,
                            backgroundColor: "#f9f9f9"
                          }}
                        >
                          <Typography mb={1}>
                            <strong>The name or title of the copyrighted work:</strong>{" "}
                            <Typography component="span">{item?.title}</Typography>
                          </Typography>

                          <Typography mb={1}>
                            <strong>Describe the copyrighted work:</strong>{" "}
                            <Typography component="span">{item?.type}</Typography>
                          </Typography>

                          <Typography mb={1}>
                            <strong>Description of Complaint:</strong>{" "}
                            <Typography component="span">{item?.example}</Typography>
                          </Typography>
                          <Typography mb={1}>
                            <strong>Is the copyright registered:</strong>{" "}
                            <Typography component="span">{item?.registered}</Typography>
                          </Typography>
                          <Typography mb={1}>
                            <strong>Where is the copyright registered:</strong>{" "}
                            <Typography component="span">{item?.registeredAt}</Typography>
                          </Typography>
                          <Typography>
                            <strong>What is the registration number:</strong>{" "}
                            <Typography component="span">{item?.registrationNumber}</Typography>
                          </Typography>
                        </Paper>
                      ))}
                    </>
                  )}
                </Box>
              </>
            ) : (
              <>
                <DetailItem
                  label="Shop Name"
                  value={
                   reportData?.storedata?.shop_name
                  }
                />
                <DetailItem label="Reason" value={reportData.reason} />
                <DetailItem label="Descrition" value={reportData.description} />
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default ViewShopReport;
