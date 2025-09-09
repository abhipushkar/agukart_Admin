import styled from "@emotion/styled";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { ApiService } from "app/services/ApiService";
// import { toast } from "react-toastify";
import { localStorageKey } from "app/constant/localStorageKey";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useEffect } from "react";
import { EditTwoTone } from "@mui/icons-material";
import { Fragment } from "react";
import ConfirmModal from "app/components/ConfirmModal";

const AddVariant = () => {
  const [inputFields, setInputFields] = useState([
    { id: 1, attributeValue: "", sortOrder: "", status: false, _id: "" }
  ]);
  console.log("inputFieldsinputFields", inputFields);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useSearchParams();
  const [editData, setEditData] = useState({});

  const [deleteValue, setDeleteValue] = useState([]);
  // console.log("deleteValuedeleteValue", deleteValue);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState("")
  const [removeData, setRemoveData] = useState({
    i: "",
    deleteId: ""
  });

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login)
  };

  const handleOpen = (type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut()
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (route !== null) {
      navigate(route)
    }
    setRoute(null)
    setMsg("")
  };

  const navigate = useNavigate();

  const queryId = query.get("id");

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name is too short - should be 2 chars minimum")
  });

  const label = { inputProps: { "aria-label": "Switch demo" } };

  const handleAddFields = () => {
    const newInputFields = inputFields.concat({
      id: inputFields.length + 1,
      attributeValue: "",
      sortOrder: "",
      status: false,
      _id: "new"
    });
    setInputFields(newInputFields);
  };

  const handleRemoveFields = (index, id) => {
    if (removeData?.i !== "new") {
      setDeleteValue((prv) => [...prv, removeData?.deleteId]);
    }
    const newInputFields = [...inputFields];
    newInputFields.splice(removeData?.i, 1);
    setInputFields(newInputFields);
  };

  console.log("deleteValuedeleteValue", deleteValue);
  console.log("removeData", removeData);

  const handleChangeInput = (index, event) => {
    const newInputFields = [...inputFields];
    newInputFields[index][event.target.name] = event.target.value;
    setInputFields(newInputFields);
  };

  const handleChangeSwitch = (index) => {
    const newInputFields = [...inputFields];
    newInputFields[index]["status"] = !newInputFields[index]["status"];
    setInputFields(newInputFields);
  };

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const addVariantHandler = async (values) => {
    let variant_attribute = [];

    const sortedOrderMapping = inputFields
      .slice()
      .sort((a, b) => a.attributeValue.localeCompare(b.attributeValue))
      .map((e, index) => ({
        attributeValue: e.attributeValue,
        sortOrder: index + 1
      }));
    console.log({ sortedOrderMapping });

    const updatedFields = inputFields.map((field) => {
      const sortOrderObj = sortedOrderMapping.find(
        (sortedField) => sortedField.attributeValue === field.attributeValue
      );
      return {
        ...field,
        sortOrder: sortOrderObj ? sortOrderObj.sortOrder : field.sortOrder
      };
    });

    if (updatedFields.length === 1) {
      if (!updatedFields[0].attributeValue || !updatedFields[0].sortOrder) {
        handleOpen("error", "Please Add at least one Variant Attribute");
        return;
      } else {
        variant_attribute = updatedFields.map((e) => ({
          attr_name: e.attributeValue,
          sort_order: e.sortOrder,
          _id: "new",
          status: e.status
        }));
      }
    } else {
      if (
        !updatedFields[updatedFields.length - 1].attributeValue ||
        !updatedFields[updatedFields.length - 1].sortOrder
      ) {
        variant_attribute = updatedFields.slice(0, -1).map((e) => ({
          attr_name: e.attributeValue,
          sort_order: e.sortOrder,
          _id: "new",
          status: e.status
        }));
      } else {
        variant_attribute = updatedFields.map((e) => ({
          attr_name: e.attributeValue,
          sort_order: e.sortOrder,
          _id: "new",
          status: e.status
        }));
      }
    }

    const payload = {
      variant_name: values.name,
      _id: "new",
      variant_attr: variant_attribute
    };

    console.log({ payload });
    try {
      setLoading(true);
      const res = await ApiService.post(apiEndpoints.addVariant, payload, auth_key);
      console.log(res);
      if (res.status === 200) {
        setLoading(false);
        if (!queryId) {
          setRoute(ROUTE_CONSTANT.catalog.variant.list)
        }
        handleOpen("success", res?.data);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      handleOpen("error", error);
    }
  };

  const editVariant = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.editVariant}/${queryId}`, auth_key);

      if (res.status === 200) {
        setEditData(res.data.variant);
        const variantAttr = res?.data?.variant?.variantAttributes.map((e, i) => {
          return {
            id: i + 1,
            attributeValue: e.attribute_value,
            sortOrder: e.sort_order,
            status: e.status,
            _id: e._id
          };
        });
        setInputFields(variantAttr);
      }
    } catch (error) {
      console.log(error);
      handleOpen("error", error);
    }
  };

  const editVariantHandler = async (values) => {
    const sortedOrderMapping = inputFields
      .slice()
      .sort((a, b) => a.attributeValue.localeCompare(b.attributeValue))
      .map((e, index) => ({
        attributeValue: e.attributeValue,
        sortOrder: index + 1
      }));

    const updatedInputFields = inputFields.map((field) => {
      const sortOrderObj = sortedOrderMapping.find(
        (sortedField) => sortedField.attributeValue === field.attributeValue
      );
      return {
        ...field,
        sortOrder: sortOrderObj ? sortOrderObj.sortOrder : field.sortOrder
      };
    });

    const renamedInputFields = updatedInputFields.map(
      ({ id, attributeValue, sortOrder, status, _id, ...rest }) => ({
        attr_name: attributeValue,
        sort_order: sortOrder,
        status: status,
        _id: _id,
        ...rest
      })
    );

    const Editpayload = {
      variant_name: values.name,
      _id: editData._id,
      variant_attr: renamedInputFields,
      deletedAttrIds: deleteValue
    };

    try {
      setLoading(true);
      const res = await ApiService.post(apiEndpoints.addVariant, Editpayload, auth_key);
      console.log(res);
      if (res.status === 200) {
        setLoading(false);
        if (!queryId) {
          setRoute(ROUTE_CONSTANT.catalog.variant.list)
        }
        handleOpen("success", res?.data);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (queryId) {
      editVariant();
    }
  }, []);

  const handleReset = () => {
    setInputFields([{ id: 1, attributeValue: "", sortOrder: "", status: false }]);
  };

  return (
    <Fragment>
      <Box sx={{ margin: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
          <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
            <Box>
              <AppsIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
            </Box>
          </Stack>
          <Divider />
          <Box sx={{ ml: "24px", mt: "16px" }}>
            <Button
              onClick={() => navigate(ROUTE_CONSTANT.catalog.variant.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Variant List
            </Button>
          </Box>
        </Box>
        <Box sx={{ py: "16px" }} component={Paper}>
          <Stack sx={{ ml: "16px", mb: "12px" }} gap={1} direction={"row"}>
            <Box>
              <AppsIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>
                {queryId ? "Edit Variant" : "Add Variant"}
              </Typography>
            </Box>
          </Stack>
          <Divider />

          <Formik
            initialValues={{
              name: queryId ? editData?.variant_name || "" : "",
              category: queryId ? editData?.display_layout : "",
              sortOrder: queryId ? editData.sort_order : ""
            }}
            validationSchema={validationSchema} // Add validation schema here
            enableReinitialize={true}
            onSubmit={(values) => {
              if (queryId) {
                editVariantHandler(values);
              } else {
                addVariantHandler(values);
              }
              // addVariantHandler(values);
            }}
          >
            {({ values, handleChange, handleSubmit, errors, touched, resetForm }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <Stack gap={"16px"} sx={{ p: "16px", pb: 0 }}>
                    <TextField
                      id="name"
                      name="name"
                      label={" Enter Variant Name"}
                      placeholder={"Enter Variant Name"}
                      type="text"
                      value={values.name}
                      sx={{
                        "& .MuiInputBase-root": {
                          height: "40px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                      onChange={handleChange}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Stack>

                  <Stack gap={"16px"} sx={{ p: "16px", pb: 0 }}>
                    {inputFields.map((inputField, index) => (
                      <Stack
                        key={inputField.id}
                        gap={"16px"}
                        alignItems={"center"}
                        direction={"row"}
                      >
                        <TextField
                          id={`attributeValue${inputField.id}`}
                          name="attributeValue"
                          label={"Attribute Value"}
                          sx={{
                            "& .MuiInputBase-root": {
                              height: "40px"
                            },
                            "& .MuiFormLabel-root": {
                              top: "-7px"
                            }
                          }}
                          placeholder={"Enter Attribute Value"}
                          type="text"
                          value={inputField.attributeValue}
                          onChange={(event) => handleChangeInput(index, event)}
                        />
                        {/* <TextField
                          id={`sortorder${inputField.id}`}
                          name="sortOrder"
                          sx={{
                            "& .MuiInputBase-root": {
                              height: "40px"
                            },
                            "& .MuiFormLabel-root": {
                              top: "-7px"
                            }
                          }}
                          label={"Sort Order"}
                          placeholder={"Enter Sort Order"}
                          type="text"
                          value={inputField.sortOrder}
                          onChange={(event) => handleChangeInput(index, event)}
                        /> */}
                        <Switch
                          name="status"
                          checked={inputField.status}
                          onChange={() => handleChangeSwitch(index)}
                        />

                        <Box>
                          {index === inputFields.length - 1 ? (
                            <>
                              {queryId && (
                                <Button
                                  variant="contained"
                                  sx={{
                                    bgcolor: "#DD3A49",
                                    mr: "16px",
                                    "&:hover": {
                                      bgcolor: "#FF5A5F" // Change this to your desired hover color
                                    }
                                  }}
                                  // onClick={() => handleRemoveFields(index, inputField._id)}
                                  onClick={() => {
                                    handleOpen("remove");
                                    // handleRemoveFields(index, inputField._id)
                                    setRemoveData(() => ({ i: index, deleteId: inputField._id }));
                                  }}
                                  type="button"
                                >
                                  Remove
                                </Button>
                              )}
                              <Button
                                sx={{ mr: "16px" }}
                                variant="contained"
                                color="primary"
                                onClick={handleAddFields}
                                disabled={
                                  !inputFields[inputFields.length - 1].attributeValue
                                    ? // !inputFields[inputFields.length - 1].sortOrder
                                    true
                                    : false
                                }
                                type="button"
                              >
                                Add More
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="contained"
                              sx={{
                                bgcolor: "#DD3A49",
                                "&:hover": {
                                  bgcolor: "#FF5A5F" // Change this to your desired hover color
                                }
                              }}
                              // onClick={() => handleRemoveFields(index, inputField._id)}
                              onClick={() => {
                                handleOpen("remove");
                                // handleRemoveFields(index, inputField._id)
                                setRemoveData(() => ({ i: index, deleteId: inputField._id }));
                              }}
                              type="button"
                            >
                              Remove
                            </Button>
                          )}
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                  <Box sx={{ ml: "16px", mt: "16px", width: "100%" }}>
                    <Button
                      endIcon={loading ? <CircularProgress size={15} /> : ""}
                      disabled={loading ? true : false}
                      sx={{ mr: "16px" }}
                      variant="contained"
                      color="primary"
                      type="submit"
                    >
                      Submit
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      type="reset"
                      // onClick={() => {
                      //   // resetForm();
                      //   setInputFields([
                      //     { id: 1, attributeValue: "", sortOrder: "", status: false }
                      //   ]);
                      // }}
                      onClick={() => handleOpen("reset")}
                    >
                      Reset
                    </Button>
                  </Box>
                </form>
              );
            }}
          </Formik>
        </Box>
      </Box>
      <ConfirmModal
        open={open}
        handleClose={handleClose}
        handleReset={handleReset}
        type={type}
        msg={msg}
        handleRemoveFields={handleRemoveFields}
      />
    </Fragment>
  );
};

export default AddVariant;
