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
  IconButton
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
  console.log({alreadySelectedRegions})
  const [openSection,setOpenSection] = useState("");
  const [regionToEdit, setRegionToEdit] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  const [countryData, setCountryData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
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

  const renderTable = (section) => (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Regions</TableCell>
            <TableCell>Transit Time (Min / Max Days)</TableCell>
            <TableCell>
              Shipping Fee
              <Typography variant="body2" color="textSecondary">
                (Per Order / Per Item)
              </Typography>
            </TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shippingTemplateData[section]?.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {row.region.join(", ")}
                  <IconButton onClick={() => handleEditRegion(index, section)}>
                    <EditIcon />
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    value={row.transitTime.minDays}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        handleRowChange(section, index, "transitTime", {
                          ...row.transitTime,
                          minDays: e.target.value
                        });
                      }
                    }}
                    placeholder="Min Days"
                    sx={{ width: "40%" }}
                  />
                  <TextField
                    value={row.transitTime.maxDays}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        handleRowChange(section, index, "transitTime", {
                          ...row.transitTime,
                          maxDays: e.target.value
                        });
                      }
                    }}
                    placeholder="Max Days"
                    sx={{ width: "40%" }}
                  />
                </Box>
              </TableCell>
              <TableCell>
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
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Button
                  variant="text"
                  color="error"
                  onClick={() => handleDeleteRow(section, index)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => handleAddRow(section)}
        sx={{ margin: 2 }}
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
    }
    setRoute(null);
    setMsg(null);
  };

  const handleSaveShippingTemplate = async () => {
    try {
      const payload = {
        _id: queryId ? queryId : "new",
        title: title,
        shippingTemplateData: shippingTemplateData
      };
      const res = await ApiService.post(apiEndpoints.addShippingTemplate, payload, auth_key);
      if (res?.status == 200) {
        if (!queryId) {
          setToggleShippingTemplate(false);
          setShippingTemplateData({ standardShipping: [], expedited: [], twoDays: [], oneDay: [] });
          setTitle("");
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

  useEffect(() => {
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
          >
            Back
          </Button>
        )
      }
      <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom>
          Shipping Template
        </Typography>
        <Box sx={{ marginBottom: 3 }}>
          <TextField
            label="Shipping Template Name"
            variant="outlined"
            fullWidth
            placeholder="Enter template name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Box>

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
