import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  Grid // Added Grid for better layout
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { useCallback } from "react";
import { localStorageKey } from "app/constant/localStorageKey";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ConfirmModal from "app/components/ConfirmModal";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const InternationalShipping = ({
  queryId,
  title,
  setTitle,
  setToggleShippingTemplate,
  shippingTemplateData,
  openSections,
  setOpenSections,
  setShippingTemplateData,
  getAllTemplateData
}) => {
  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [openRegionModal, setOpenRegionModal] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [alreadySelectedRegions, setAlreadySelectedRegions] = useState({
    standardShipping: new Set(),
    expedited: new Set(),
    twoDays: new Set(),
    oneDay: new Set()
  });
  console.log({ alreadySelectedRegions })
  const [openSection, setOpenSection] = useState("");
  const [regionToEdit, setRegionToEdit] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  // Add global min/max days state
  const storedTransitTimes = JSON.parse(localStorage.getItem('globalTransitTimeData') || '[]');
  const globalTransitTimeData = storedTransitTimes.find(gttd => gttd.shippingTemplateId === queryId) || {};   // Find matching record
  const [globalMinDays, setGlobalMinDays] = useState(globalTransitTimeData.globalMinDays || 0);
  const [globalMaxDays, setGlobalMaxDays] = useState(globalTransitTimeData.globalMaxDays || 0);

  const handleAddRow = (section) => {
    const newRow = {
      region: [],
      transitTime: { minDays: "", maxDays: "" },
      shippingFee: { perOrder: "", perItem: "" }
    };
    setShippingTemplateData((prevData) => ({
      ...prevData,
      [section]: [...prevData[section], newRow]
    }));
  };

  const handleRowChange = (section, index, field, value) => {
    setShippingTemplateData((prevData) => ({
      ...prevData,
      [section]: prevData[section].map((row, i) => (i === index ? { ...row, [field]: value } : row))
    }));
  };

  const handleDeleteRow = (section, index) => {
    setShippingTemplateData((prevData) => ({
      ...prevData,
      [section]: prevData[section].filter((_, i) => i !== index)
    }));
  };

  // Calculate final transit time (local + global)
  const calculateFinalTransitTime = (localMin, localMax) => {
    const finalMin = (parseInt(localMin) || 0) + (parseInt(globalMinDays) || 0);
    const finalMax = (parseInt(localMax) || 0) + (parseInt(globalMaxDays) || 0);
    return { finalMin, finalMax };
  };

  // Update the renderTable function to show final transit times
  const renderTable = (section) => (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ p: 1, width: '40%' }}>Regions</TableCell>
            <TableCell sx={{ width: '30%', px: 2 }}>
              Transit Time
              <Typography variant="body2" color="textSecondary">
                (Local Days / Final Days)
              </Typography>
            </TableCell>
            <TableCell sx={{ width: '20%' }}>
              Shipping Fee
              <Typography variant="body2" color="textSecondary">
                (Per Order / Per Item)
              </Typography>
            </TableCell>
            <TableCell sx={{ width: '10%' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shippingTemplateData[section]?.map((row, index) => {
            const { finalMin, finalMax } = calculateFinalTransitTime(row.constantTransitTime?.constMinDays ?? row.transitTime.minDays, row.constantTransitTime?.constMaxDays ?? row.transitTime.maxDays);

            const regionText = row.region.join(", ");
            const rowKey = `${section}-${index}`;
            const isExpanded = expandedRows[rowKey] || false;
            const shouldTruncate = regionText.length > 200;
            const displayText = isExpanded ? regionText : regionText.substring(0, 200);

            const toggleExpand = () => {
              setExpandedRows((prev) => ({
                ...prev,
                [rowKey]: !prev[rowKey]
              }));
            };

            return (
              <TableRow key={index} sx={{ maxHeight: '115.5px' }}>
                <TableCell sx={{ p: 1, width: '40%' }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        {displayText}
                        {shouldTruncate && !isExpanded && '...'}
                      </Typography>
                      {shouldTruncate && (
                        <Button
                          size="small"
                          onClick={toggleExpand}
                          sx={{ p: 0, mt: 0.5, textTransform: 'none' }}
                        >
                          {isExpanded ? 'View Less' : 'View More'}
                        </Button>
                      )}
                    </Box>
                    <IconButton onClick={() => handleEditRegion(index, section)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '30%', px: 2 }}>
                  <Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <TextField
                        value={row.constantTransitTime?.constMinDays ?? row.transitTime.minDays}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            handleRowChange(section, index, "transitTime", {
                              ...row.transitTime,
                              minDays: e.target.value
                            });
                          }
                        }}
                        placeholder="Local Min Days"
                        sx={{ width: "40%" }}
                        size="small"
                      />
                      <Typography variant="body2" color="textSecondary">
                        →
                      </Typography>
                      {/* <TextField
                        value={finalMin}
                        placeholder="Final Min Days"
                        sx={{ width: "40%" }}
                        size="small"
                        InputProps={{
                          readOnly: true,
                        }}
                      /> */}
                      <Typography>
                        {finalMin}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <TextField
                        value={row.constantTransitTime?.constMaxDays ?? row.transitTime.maxDays}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            handleRowChange(section, index, "transitTime", {
                              ...row.transitTime,
                              maxDays: e.target.value
                            });
                          }
                        }}
                        placeholder="Local Max Days"
                        sx={{ width: "40%" }}
                        size="small"
                      />
                      <Typography variant="body2" color="textSecondary">
                        →
                      </Typography>
                      {/* <TextField
                        value={finalMax}
                        placeholder="Final Max Days"
                        sx={{ width: "40%" }}
                        size="small"
                        InputProps={{
                          readOnly: true,
                        }}
                      /> */}
                      <Typography>
                        {finalMax}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '20%' }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      value={row.shippingFee.perOrder}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) {
                          handleRowChange(section, index, "shippingFee", {
                            ...row.shippingFee,
                            perOrder: e.target.value
                          });
                        }
                      }}
                      placeholder="Per Order"
                      sx={{ width: "40%" }}
                      size="small"
                    />
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      +
                    </Typography>
                    <TextField
                      value={row.shippingFee.perItem}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) {
                          handleRowChange(section, index, "shippingFee", {
                            ...row.shippingFee,
                            perItem: e.target.value
                          });
                        }
                      }}
                      placeholder="Per Item"
                      sx={{ width: "40%" }}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '10%' }}>
                  <Button
                    variant="text"
                    color="error"
                    onClick={() => handleDeleteRow(section, index)}
                    size="small"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => handleAddRow(section)}
        sx={{ margin: 2 }}
        size="small"
      >
        Add New Region
      </Button>
    </TableContainer>
  );

  const handleEditRegion = (index, section) => {
    const selectedRegions = new Set();
    Object.keys(shippingTemplateData).forEach((key) => {
      shippingTemplateData[key].forEach((row, rowIndex) => {
        if (key === section && !(rowIndex === index)) {
          row?.region?.forEach((region) => selectedRegions.add(region));
        }
      });
    });
    setAlreadySelectedRegions((prev) => ({
      ...prev,
      [section]: selectedRegions
    }));
    setRegionToEdit({ index, section });
    setSelectedCountries(shippingTemplateData[section][index].region);
    setOpenRegionModal(true);
    setOpenSection(section);
  };

  const handleModalClose = () => {
    setOpenRegionModal(false);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountries((prev) => {
      if (prev.includes(country)) {
        return prev.filter((item) => item !== country);
      } else {
        return [...prev, country];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCountries([]);
    } else {
      const unselectedCountries = countryData.filter(country =>
        !alreadySelectedRegions[openSection]?.has(country)
      );
      setSelectedCountries(unselectedCountries);
    }
    setSelectAll(!selectAll);
  };

  const handleSaveRegions = () => {
    if (regionToEdit) {
      const { index, section } = regionToEdit;
      const updatedData = [...shippingTemplateData[section]];
      updatedData[index] = { ...updatedData[index], region: selectedCountries };
      setShippingTemplateData((prevData) => ({
        ...prevData,
        [section]: updatedData
      }));
      setOpenRegionModal(false);
    }
  };

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
    } else {
      navigate(-1);
    }
    setRoute(null);
    setMsg(null);
  };

  const handleSaveShippingTemplate = async () => {
    try {

      // Get existing shpping data from local storage
      const storedTransitTimes = JSON.parse(
        localStorage.getItem('globalTransitTimeData') || '[]'
      );

      // Check if entry already exists
      const existingIndex = storedTransitTimes.findIndex(
        item => item.shippingTemplateId === queryId
      );

      if (existingIndex !== -1) {
        // Update existing
        storedTransitTimes[existingIndex] = {
          shippingTemplateId: queryId,
          globalMinDays,
          globalMaxDays
        };
      } else {
        // Add new
        storedTransitTimes.push({
          shippingTemplateId: queryId,
          globalMinDays,
          globalMaxDays
        });
      }

      // Save back to localStorage
      localStorage.setItem(
        'globalTransitTimeData',
        JSON.stringify(storedTransitTimes)
      );
      // Create a deep copy of shippingTemplateData to include final calculations
      const shippingTemplateDataWithCalculations = { ...shippingTemplateData };

      // Calculate final transit times for each section
      Object.keys(shippingTemplateDataWithCalculations).forEach(section => {
        shippingTemplateDataWithCalculations[section] = shippingTemplateDataWithCalculations[section].map(row => {
          const constMin = row.transitTime.minDays;
          const constMax = row.transitTime.maxDays;
          const { finalMin, finalMax } = calculateFinalTransitTime(row.constantTransitTime?.constMinDays ?? row.transitTime.minDays, row.constantTransitTime?.constMaxDays ?? row.transitTime.maxDays);
          return {
            ...row,
            calculatedTransitTime: {
              finalMin,
              finalMax
            },
            transitTime: {
              minDays: finalMin,
              maxDays: finalMax
            },
            constantTransitTime: row.constantTransitTime ?? {
              constMinDays: constMin,
              constMaxDays: constMax
            }
          };
        });
      });

      const payload = {
        _id: queryId ? queryId : "new",
        title: title,
        globalTransitTime: {
          minDays: globalMinDays,
          maxDays: globalMaxDays
        },
        shippingTemplateData: shippingTemplateDataWithCalculations
      };
      const res = await ApiService.post(apiEndpoints.addShippingTemplate, payload, auth_key);
      if (res?.status == 200) {
        if (!queryId) {
          setToggleShippingTemplate(false);
          setShippingTemplateData({ standardShipping: [], expedited: [], twoDays: [], oneDay: [] });
          setTitle("");
          setGlobalMinDays(0);
          setGlobalMaxDays(0);
          getAllTemplateData();
        }
        handleOpen("success", res?.data);
      }
    } catch (error) {
      console.log("error", error);
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    setSelectAll(selectedCountries.length === countryData.length);
  }, [selectedCountries]);

  const getCountryList = useCallback(async () => {
    try {
      const res = await ApiService.getWithoutAuth(apiEndpoints.getCountry, auth_key);
      if (res?.status == 200) {
        setCountryData(res?.data?.contryList?.map((item) => item.name));
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [auth_key]);

  // Fetch template data if queryId exists
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (queryId) {
        try {
          const res = await ApiService.get(
            `${apiEndpoints.getShippingTemplateById}/${queryId}`,
            auth_key
          );
          if (res.status === 200) {
            // Set global days from API if available
            if (res.data.template.globalTransitTime) {
              setGlobalMinDays(res.data.template.globalTransitTime.minDays || 0);
              setGlobalMaxDays(res.data.template.globalTransitTime.maxDays || 0);
            }
            const openState = {
              standardShipping: (res.data.template?.shippingTemplateData?.standardShipping?.length || 0) > 0,
              expedited: (res.data.template?.shippingTemplateData?.expedited?.length || 0) > 0,
              twoDays: (res.data.template?.shippingTemplateData?.twoDays?.length || 0) > 0,
              oneDay: (res.data.template?.shippingTemplateData?.oneDay?.length || 0) > 0
            };
            setOpenSections(openState);
          }
        } catch (error) {
          console.error("Error fetching template data:", error);
          handleOpen("error", error);
        }
      }
    };

    fetchTemplateData();
  }, [queryId]);

  useEffect(() => {
    if (!queryId) {
      setOpenSections({
        standardShipping: true,
        expedited: false,
        twoDays: false,
        oneDay: false,
      });
    }
    getCountryList();
  }, []);

  return (
    <>
      {
        queryId && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
        )
      }
      <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom>
          Shipping Template
        </Typography>

        {/* Template Name and Global Transit Time Fields */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Shipping Template Name"
              variant="outlined"
              fullWidth
              placeholder="Enter template name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Processing Time (Days)
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                These will be added to all local transit times
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Global Min Days"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={globalMinDays}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setGlobalMinDays(e.target.value);
                      }
                    }}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Global Max Days"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={globalMaxDays}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setGlobalMaxDays(e.target.value);
                      }
                    }}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Standard Shipping */}
        <Box>
          <Checkbox checked={openSections.standardShipping} onChange={() => setOpenSections({ ...openSections, standardShipping: !openSections.standardShipping })} />
          <Typography
            variant="h6"
            sx={{ display: "inline", cursor: "pointer" }}
            onClick={() => setOpenSections({ ...openSections, standardShipping: !openSections.standardShipping })}
          >
            Standard Shipping
          </Typography>
          <Collapse in={openSections.standardShipping}>{renderTable("standardShipping")}</Collapse>
        </Box>

        {/* Expedited Shipping */}
        <Box>
          <Checkbox checked={openSections.expedited} onChange={() => setOpenSections({ ...openSections, expedited: !openSections.expedited })} />
          <Typography
            variant="h6"
            sx={{ display: "inline", cursor: "pointer" }}
            onClick={() => setOpenSections({ ...openSections, expedited: !openSections.expedited })}
          >
            Expedited Shipping
          </Typography>
          <Collapse in={openSections.expedited}>{renderTable("expedited")}</Collapse>
        </Box>

        {/* Two-Day Delivery */}
        <Box>
          <Checkbox checked={openSections.twoDays} onChange={() => setOpenSections({ ...openSections, twoDays: !openSections.twoDays })} />
          <Typography
            variant="h6"
            sx={{ display: "inline", cursor: "pointer" }}
            onClick={() => setOpenSections({ ...openSections, twoDays: !openSections.twoDays })}
          >
            Two-Day Delivery
          </Typography>
          <Collapse in={openSections.twoDays}>{renderTable("twoDays")}</Collapse>
        </Box>

        {/* One-Day Delivery */}
        <Box>
          <Checkbox checked={openSections.oneDay} onChange={() => setOpenSections({ ...openSections, oneDay: !openSections.oneDay })} />
          <Typography
            variant="h6"
            sx={{ display: "inline", cursor: "pointer" }}
            onClick={() => setOpenSections({ ...openSections, oneDay: !openSections.oneDay })}
          >
            One-Day Delivery
          </Typography>
          <Collapse in={openSections.oneDay}>{renderTable("oneDay")}</Collapse>
        </Box>

        <Box sx={{ textAlign: "right", marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSaveShippingTemplate}>
            Save
          </Button>
        </Box>

        {/* Region Selection Modal */}
        <Dialog open={openRegionModal} onClose={handleModalClose}>
          <DialogTitle>Select Regions</DialogTitle>
          <DialogContent>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={selectAll} onChange={handleSelectAll} />}
                label="Select All"
              />
              {countryData.map((country, idx) => {
                const isAlreadySelectedElsewhere = alreadySelectedRegions[openSection]?.has(country) || false;
                return <FormControlLabel
                  key={idx}
                  control={
                    <Checkbox
                      checked={selectedCountries.includes(country)}
                      disabled={isAlreadySelectedElsewhere}
                      onChange={() => handleCountrySelect(country)}
                    />
                  }
                  label={country}
                />
              })}
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSaveRegions} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
      </Box>
    </>
  );
};

export default InternationalShipping;
