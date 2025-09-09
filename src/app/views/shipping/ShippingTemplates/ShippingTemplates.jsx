import React, { useState, useEffect } from "react";
import {
  Button,
  DialogActions,
  TextField,
  DialogTitle,
  DialogContent,
  Dialog,
  ListItem,
  ListItemText,
  List,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import InternationalShipping from "./InternationalShipping";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import DropdownMenu from "./DropdownMenu";
import ConfirmModal from "app/components/ConfirmModal";

const ShippingTemplates = ({ queryId }) => {
  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const [openTemplate, setOpenTemplate] = useState(false);
  const [title, setTitle] = useState("");
  const [shippingTemplateData, setShippingTemplateData] = useState({
    standardShipping: [],
    expedited: [],
    twoDays: [],
    oneDay: [],
  });
  console.log({ shippingTemplateData });
  const [openSections, setOpenSections] = useState({
    standardShipping: false,
    expedited: false,
    twoDays: false,
    oneDay: false
  });

  const [toggleShippingTemplate, setToggleShippingTemplate] = useState(false);
  const [allTemplateData, setAllTemplateData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  // Handle modal open/close
  const handleShippingTemplateOpen = () => setOpenTemplate(true);
  const handleShippingTemplateClose = () => setOpenTemplate(false);
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
  // Toggle shipping template view
  const handleToggleShippingTemplate = () => {
    setToggleShippingTemplate(true);
    handleShippingTemplateClose();
  };

  // Fetch specific shipping template by ID
  const getTemplateData = async () => {
    try {
      const res = await ApiService.get(
        `${apiEndpoints.getShippingTemplateById}/${queryId}`,
        auth_key
      );
      if (res.status === 200) {
        setTitle(res.data.template.title);
        setShippingTemplateData(res.data.template.shippingTemplateData);
      }
    } catch (error) {
      handleOpen("error", error);
      console.error("Error fetching template data:", error);
    }
  };

  useEffect(() => {
    if (queryId) {
      setToggleShippingTemplate(true);
      getTemplateData();
    }
  }, [queryId]);

  // Fetch all templates
  const getAllTemplateData = async () => {
    try {
      const res = await ApiService.get(
        apiEndpoints.getShippingTemplates,
        auth_key
      );
      if (res.status === 200) {
        setAllTemplateData(res.data.templates);
        setOpenSections({
          standardShipping: true,
          expedited: true,
          twoDays: true,
          oneDay: true
        })
      }
    } catch (error) {
      handleOpen("error", error);
      console.error("Error fetching all templates:", error);
    }
  };

  useEffect(() => {
    getAllTemplateData();
  }, []);

  // Navigate to edit a template
  const handleEdit = (id) => {
    navigate(`${ROUTE_CONSTANT.Shipping.ShippingSettings.list}?id=${id}`);
  };

  const handleCopy = (template) => {
    setToggleShippingTemplate(true);
    setTitle(template.title);
    setShippingTemplateData(template.shippingTemplateData);
    setOpenSections({
      standardShipping: true,
      expedited: true,
      twoDays: true,
      oneDay: true
    })
  }

  const handleSetDefault = async(id) => {
    try {
      const payload = {
        id:id,
        isDefault:true
      };
      const res = await ApiService.post(`${apiEndpoints.setDefaultTemplate}`,payload,auth_key);
      if (res.status === 200) {
        getAllTemplateData();
        handleOpen("success", res?.data);
      }
    } catch (error) {
      console.error("Error setting default template:", error);
      handleOpen("error", error);
    }
  }

  const handleDelete = async (id) => {
    try {
      const payload = {
        id:id
      }
      const res = await ApiService.post(`${apiEndpoints.deleteShippingTemplate}`,payload,auth_key);
      if (res.status === 200) {
        getAllTemplateData();
        handleOpen("success", res?.data);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      handleOpen("error", error);
    }
  }

  return (
    <>
      {!toggleShippingTemplate ? (
        <>
          {/* Create New Template Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleShippingTemplateOpen}
            sx={{ marginBottom: 2 }}
          >
            Create New Shipping Template
          </Button>

          {/* Template List */}
          <List>
            {allTemplateData.length > 0 ? (
              allTemplateData.map((template, index) => (
                <ListItem
                  key={index}
                  divider
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ListItemText primary={template.title} />
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {template.isDefault && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        disableRipple
                      >
                        Default
                      </Button>
                    )}
                    <DropdownMenu
                      onEdit={() => handleEdit(template._id)}
                      onCopy={() => handleCopy(template)}
                      onSetDefault={() =>handleSetDefault(template._id)}
                      onDelete={() => handleDelete(template._id)}
                    />
                  </div>
                </ListItem>
              ))
            ) : (
              <ListItem style={{ textAlign: "center", borderBottom: "none" }}>
                <ListItemText primary="No templates available" />
              </ListItem>
            )}
          </List>
        </>
      ) : (
        <InternationalShipping
          queryId={queryId}
          title={title}
          setTitle={setTitle}
          setToggleShippingTemplate={setToggleShippingTemplate}
          shippingTemplateData={shippingTemplateData}
          openSections={openSections}
          setOpenSections={setOpenSections}
          setShippingTemplateData={setShippingTemplateData}
          getAllTemplateData={getAllTemplateData}
        />
      )}

      {/* Create New Template Dialog */}
      <Dialog open={openTemplate} onClose={handleShippingTemplateClose}>
        <DialogTitle>Create New Shipping Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            variant="outlined"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShippingTemplateClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleToggleShippingTemplate}
            variant="contained"
            color="primary"
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />   
    </>
  );
};

export default ShippingTemplates;
