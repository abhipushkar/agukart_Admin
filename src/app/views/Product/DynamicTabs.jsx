import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import QuillDes from "./TabDescriptionEditor/QuillDes";

const DynamicTabs = ({
  formData,
  setFormData,
  setTabsValue,
  EditProducthandler,
  queryId,
  loading,
  draftLoading,
  handleDraftProduct
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [newTab, setNewTab] = useState({ title: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTab((prev) => ({ ...prev, [name]: value }));
  };

  // Add new tab
  const saveTab = () => {
    if (newTab.title.trim() && newTab.description.trim()) {
      setFormData((prev) => ({
        ...prev,
        tabs: [...(prev.tabs || []), newTab]
      }));
      setNewTab({ title: "", description: "" });
      setIsAdding(false);
    }
  };

  // Enable edit mode
  const enableEdit = (index) => {
    setEditIndex(index);
    setNewTab({
      title: formData?.tabs[index].title,
      description: formData.tabs[index].description
    });
  };

  // Save edited tab
  const saveEdit = () => {
    const updatedTabs = [...formData?.tabs];
    updatedTabs[editIndex] = { title: newTab.title, description: newTab.description };
    setFormData((prev) => ({ ...prev, tabs: updatedTabs }));
    setEditIndex(null);
    setNewTab({ title: "", description: "" });
  };

  // Delete tab
  const deleteTab = (index) => {
    const updatedTabs = formData?.tabs.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, tabs: updatedTabs }));

    // Adjust active tab index
    if (activeTab >= updatedTabs.length) {
      setActiveTab(updatedTabs.length - 1);
    }
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        {formData?.tabs?.map((tab, index) => (
          <Tab key={index} label={tab.title} />
        ))}
      </Tabs>

      {/* Tab Content */}
      {formData?.tabs?.length > 0 && (
        <Box
          sx={{
            p: 2,
            border: "1px solid #ccc",
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <Box>
            <Typography variant="h6">{formData?.tabs[activeTab]?.title}</Typography>
            {/* <Typography>{formData?.tabs[activeTab]?.description}</Typography> */}
          </Box>
          <Box>
            <IconButton onClick={() => enableEdit(activeTab)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => deleteTab(activeTab)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editIndex !== null) && (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Tab Title"
            name="title"
            variant="outlined"
            size="small"
            value={newTab.title}
            onChange={handleChange}
          />
          <Box width={"100%"}>
            <Box
              sx={{
                height: "auto", // Set your desired height
                width: "100%"
              }}
            >
              <QuillDes newTab={newTab} setNewTab={setNewTab} />
            </Box>
          </Box>
          {editIndex !== null ? (
            <Box>
              <Button variant="contained" color="secondary" onClick={saveEdit}>
                Save Changes
              </Button>
            </Box>
          ) : (
            <Box>
              <Button variant="contained" color="success" onClick={saveTab}>
                Save
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Add New Tab Button */}
      {!isAdding && editIndex === null && (
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => setIsAdding(true)}>
          Add New Tab
        </Button>
      )}

      {/* Next & Submit Buttons */}
      <Box sx={{ display: "flex", gap: "5px", alignItems: "center", justifyContent: "flex-end" }}>
        <Button
          endIcon={draftLoading ? <CircularProgress size={15} /> : ""}
          disabled={draftLoading}
          onClick={handleDraftProduct}
          variant="contained"
        >
          Save As Draft
        </Button>
        <Box sx={{ display: "flex", gap: "5px" }}>
          <Button onClick={() => setTabsValue((prv) => prv + 1)} variant="contained">
            Next
          </Button>

          {queryId && (
            <Button
              endIcon={loading ? <CircularProgress size={15} /> : ""}
              disabled={loading}
              onClick={EditProducthandler}
              variant="contained"
            >
              Submit
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DynamicTabs;
