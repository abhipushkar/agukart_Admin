import * as React from "react";
import FormControl from "@mui/material/FormControl";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from "@mui/material";
import { TextField, CircularProgress } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { toast } from "react-toastify";
import {
  genderData,
  sizeOptions,
  sizeMapOptions,
  colorOptionsMaps,
  shippingWeightOptions,
  unitValueOptions,
  packageunitValues,
  combinedMaterials,
  PackageDimenssion
} from "app/data/Index";
import { useCallback } from "react";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useEffect } from "react";
import { useState } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import VariantModal from "./VariantModal";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import TableRowComponent from "./TableRowComponent";

const label = { inputProps: { "aria-label": "Switch demo" } };

const CustomisationTabs = ({
  formData,
  EditProducthandler,
  setFormData,
  setTabsValue,
  setKeys,
  keys,
  EdtiFroemData,
  loading,
  draftLoading,
  combinations,
  setCombinations,
  formValues,
  setFormValues,
  variationsData,
  setVariationsData,
  selectedVariations,
  setSelectedVariations,
  combinationError,
  setCombinationError,
  showAll,
  setShowAll,
  handleDraftProduct,
  queryId
}) => {
  const [age, setAge] = React.useState("");
  const [value, setValue] = React.useState("female");
  const [selectedLaunchDate, setselectedLaunchDate] = React.useState(formData.launchData);
  const [selectedReleasDate, setSelectedRelesDate] = React.useState(formData.releaseDate);
  const [fields, setFields] = React.useState(formData.stylesKeyWords);
  const [varientName, setVarientName] = React.useState([]);
  const [selectedVariantIds, setSelectedVariantIds] = React.useState([]);
  // const [handleClickParentID, sethandleClickParentID] = React.useState([]);
  const [allTags, setAllTags] = useState([]);
  const [error, setError] = useState("");
  // const [combinations, setCombinations] = useState([]);
  const navigate = useNavigate();
  // const [keys, setKeys] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [show, setShow] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [showVariantList, setShowVariantList] = useState(false);
  const [attrValues, setAttrValues] = useState({
    name: "",
    values: []
  });
  const [isEdit, setIsEdit] = useState(false);
  const [attrOptions, setAttrOptions] = useState([]);
  const handleOpenVariant = () => {
    setFormData((prev) => ({ ...prev, isCombination: true }));
    setShow(true);
  }
  const handleCloseVariant = () => {
    setShow(false);
  }
  console.log({ combinations });

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

  console.log("varientNamevarientName", varientName);

  React.useEffect(() => {
    EdtiFroemData?.gender?.forEach((item) => {
      const find = formData.gender.find((gen) => {
        return gen.label === item;
      });
      if (find) return;
      genderData?.forEach((gender) => {
        if (item == gender.label) {
          setFormData((prev) => ({
            ...prev,
            gender: [...prev.gender, gender]
          }));
        }
      });
    });

    // material dataa

    EdtiFroemData?.material?.forEach((item) => {
      const find = formData.combinedMaterials.find((gen) => {
        return gen.label === item;
      });
      if (find) return;
      combinedMaterials?.forEach((gender) => {
        if (item == gender.label) {
          setFormData((prev) => ({
            ...prev,
            combinedMaterials: [...prev.combinedMaterials, gender]
          }));
        }
      });
    });

    // end matetial deaetaaa
  }, [formData]);

  const handleDateChange = (newDate) => {
    setselectedLaunchDate(newDate);
    console.log(newDate ? newDate.format("YYYY-MM-DD") : "No date selected");
  };
  const handleReleaseDateChange = (newDate) => {
    setSelectedRelesDate(newDate);
    console.log(newDate ? newDate.format("YYYY-MM-DD") : "No date selected");
  };
  // const handleChange = (event, newKeys) => {
  //   setValue(event.target.value);
  //   setKeys(newKeys);
  // };
  // const handleAddKey = () => {
  //   if (formData.searchTerms.trim() && !keys.includes(formData.searchTerms.trim())) {
  //     setKeys([...keys, formData.searchTerms.trim()]);
  //     setFormData((prev) => ({
  //       ...prev,
  //       serchTemsKeyArray: [...keys, formData.searchTerms.trim()]
  //     }));
  //   }
  // };

  const handleChange = (event, newKeys) => {
    // Extract titles (or use strings as they are) from the newKeys
    setValue(event.target.value);
    const titles = newKeys?.map((option) => (typeof option === "string" ? option : option.title));

    // Update both keys and serchTemsKeyArray with the titles
    setKeys(titles);
    setFormData((prev) => ({
      ...prev,
      serchTemsKeyArray: titles
    }));
    setError("");
  };

  const handleAddKey = () => {
    if (formData.searchTerms.trim() && !keys.includes(formData.searchTerms.trim())) {
      const newKey = formData.searchTerms.trim();

      // Update both keys and serchTemsKeyArray
      setKeys((prevKeys) => [...prevKeys, newKey]);
      setFormData((prev) => ({
        ...prev,
        serchTemsKeyArray: [...prev.serchTemsKeyArray, newKey]
      }));
    }
  };

  const handleDelete = (keyToDelete) => () => {
    setKeys((keys) => {
      // Filter out the deleted key from the keys array
      const updatedKeys = keys.filter((key) => key !== keyToDelete);

      // Update serchTemsKeyArray with the updated keys
      setFormData((prev) => ({
        ...prev,
        serchTemsKeyArray: updatedKeys
      }));

      return updatedKeys; // Now both keys and serchTemsKeyArray will have the same data format
    });
  };

  const formDataHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const formDataSingleSelect = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // const handleClickMainID = (id) => {
  //   sethandleClickParentID((prevIds) => {
  //     // Ensure prevIds is always an array
  //     if (!Array.isArray(prevIds)) return [id];
  //     if (prevIds.includes(id)) {
  //       return prevIds; // Return the same array if the ID already exists (no duplicates)
  //     }
  //     return [...prevIds, id]; // Add the new ID to the array
  //   });
  //   console.log("handleClickParentIDhandleClickParentID", handleClickParentID);
  //   setFormData((prev) => ({ ...prev, ["ParentMainId"]: handleClickParentID }));
  // };
  const handleVariantChange = (variantId, value) => {
    console.log("variantIdvariantId", variantId, value);
    setFormData((prev) => {
      const updatedVarientName = prev.varientName.filter((selectedId) => {
        const parentData = varientName.find((item) => item.id === variantId);
        return !parentData?.variant_attribute.some((attr) => attr._id === selectedId);
      });
      return {
        ...prev,
        ParentMainId: value
          ? prev.ParentMainId.includes(variantId)
            ? prev.ParentMainId
            : [...prev.ParentMainId, variantId]
          : prev.ParentMainId.filter((id) => id !== variantId),
        varientName: value
          ? [...updatedVarientName, value._id]
          : updatedVarientName, 
      };
    });
    
  };

  const varintHandler = (event, value) => {
    setFormData((prv) => ({ ...prv, gender: value?.map((option) => option._id) }));
    setFormData((prv) => ({ ...prv, gender: value }));
  };

  const varintHandlerOcattion = (event, value) => {
    setFormData((prv) => ({ ...prv, productdetailsOccassion: value?.map((option) => option._id) }));
    setFormData((prv) => ({ ...prv, productdetailsOccassion: value }));
  };

  const handlevarintHandler = (event, value) => {
    setFormData((prv) => ({ ...prv, combinedMaterials: value?.map((option) => option?._id) }));
    setFormData((prv) => ({ ...prv, combinedMaterials: value }));
  };

  React.useEffect(() => {
    setFormData((prv) => ({
      ...prv,
      launchData: selectedLaunchDate,
      releaseDate: selectedReleasDate
    }));
  }, [selectedLaunchDate, selectedReleasDate]);
  const [OccassionList, setOccassionList] = React.useState([]);
  console.log("OccassionList", OccassionList);

  React.useEffect(() => {
    if (OccassionList.length > 0) {
      EdtiFroemData?.occasion?.forEach((item) => {
        console.log("kdocccssionitem", { item, OccassionList });
        const find = formData.productdetailsOccassion.find((gen) => {
          return gen._id === item;
        });
        if (find) return;
        OccassionList?.forEach((occasion) => {
          if (item == occasion._id) {
            console.log("jjoccasionoccasion", occasion);

            setFormData((prev) => ({
              ...prev,
              productdetailsOccassion: [...prev.productdetailsOccassion, occasion]
            }));
          }
        });
      });
    }
  }, [OccassionList]);

  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const addProducthandler = async () => {
    const errors = {};
    combinations.forEach((variant) => {
      variant.combinations.forEach((item, index) => {
        const isPriceCheckApplicable =
          (variationsData.length >= 2 ? formValues?.prices === variant.variant_name : true) &&
          item?.isCheckedPrice &&
          item?.isVisible;
  
        if (isPriceCheckApplicable && (!item?.price)) {
          errors[`Price-${variant.variant_name}-${index}`] = "Price is required";
        }
        const isQtyCheckApplicable =
          (variationsData.length >= 2 ? formValues?.quantities === variant.variant_name : true) &&
          item?.isCheckedQuantity &&
          item?.isVisible;
  
        if (isQtyCheckApplicable && (!item?.qty)) {
          errors[`Quantity-${variant.variant_name}-${index}`] = "Quantity is required";
        }
      });
    });
    if (Object.keys(errors).length > 0) {
      setCombinationError(errors); 
      setShowAll(true);
    } else {
      setCombinationError({}); 
      setTabsValue((prev) => prev + 1); 
    }
  };
  
  

  const getCategoryData = async () => {
    if (formData?.subCategory) {
      try {
        const res = await ApiService.get(
          `${apiEndpoints.GetVariantCategories}/${formData?.subCategory}`,
          auth_key
        );
        console.log("aaaaaaaaaaaaaesresresresres", res);
        if (res.status === 200) {
          setVarientName(res?.data?.parent);
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  };
  React.useEffect(() => {
    if (formData?.subCategory) {
      getCategoryData();
    }
  }, [formData?.subCategory]);

  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, stylesKeyWords: fields }));
  }, [fields]);

  // console.log("jjjjjjjjjjj", { inputErrors, formData });
  // const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const getBrandList = async () => {
    try {
      const res = await ApiService.get(apiEndpoints.getOccassion, auth_key);
      // console.log("getOccassiongetOccassion", res);
      if (res.status === 200) {
        setOccassionList(res?.data?.data);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };
  React.useEffect(() => {
    getBrandList();
  }, []);

  const getTagList = useCallback(async () => {
    try {
      let url = `${apiEndpoints.getAllSearchTerms}`;

      const res = await ApiService.get(url, auth_key);
      if (res.status === 200) {
        setAllTags(res?.data?.data);
        // setSearchList(myNewList);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  useEffect(() => {
    getTagList();
  }, []);

  const handleToggle = (combindex, index) => {
    setCombinations((prev) =>
      prev?.map((item, i) =>
        i === combindex
          ? {
            ...item,
            combinations: item.combinations?.map((comb, j) =>
              j === index
                ? { ...comb, isVisible: !comb.isVisible }
                : comb
            ),
          }
          : item
      )
    );
  };

    const handleImageUpload = (combindex, rowIndex, type, event) => {
        const file = event.target.files[0];
        if (!file) return;

        setCombinations(prev => {
            return prev?.map((comb, i) => {
                if (i !== combindex) return comb;

                const updatedCombinations = comb.combinations?.map((item, j) => {
                    if (j !== rowIndex) return item;

                    if (type.startsWith('main_images[')) {
                        const imgIndex = parseInt(type.match(/\[(\d+)\]/)[1]);

                        // Create or clone the main_images array
                        const newMainImages = item.main_images ? [...item.main_images] : [];

                        // Ensure array is long enough
                        while (newMainImages.length <= imgIndex) {
                            newMainImages.push(null);
                        }

                        // Store the File object - backend will process this
                        newMainImages[imgIndex] = file;

                        return {
                            ...item,
                            main_images: newMainImages
                        };
                    } else {
                        // Handle preview_image and thumbnail - store File object
                        return {
                            ...item,
                            [type]: file
                        };
                    }
                });

                return {
                    ...comb,
                    combinations: updatedCombinations
                };
            });
        });
    };

    const handleImageRemove = (combindex, rowIndex, type) => {
        setCombinations(prev => {
            return prev?.map((comb, i) => {
                if (i !== combindex) return comb;

                const updatedCombinations = comb.combinations?.map((item, j) => {
                    if (j !== rowIndex) return item;

                    if (type.startsWith('main_images[')) {
                        const imgIndex = parseInt(type.match(/\[(\d+)\]/)[1]);

                        if (!item.main_images || item.main_images.length <= imgIndex) {
                            return item;
                        }

                        const newMainImages = [...item.main_images];
                        // Set to empty string instead of null for backend compatibility
                        newMainImages[imgIndex] = "";

                        return {
                            ...item,
                            main_images: newMainImages
                        };
                    } else {
                        // Set to empty string instead of null
                        return {
                            ...item,
                            [type]: ""
                        };
                    }
                });

                return {
                    ...comb,
                    combinations: updatedCombinations
                };
            });
        });
    };

  const handleCombChange = (e, combindex, index) => {
    const { name, value } = e.target;
    console.log(combindex, index, name, value, "llllllllllllllllllllll");
    if (/^\d*$/.test(value) && value.length <= 7) {
      setCombinations((prev) =>
        prev?.map((item, i) =>
          i === combindex
            ? {
              ...item,
              combinations: item.combinations?.map((comb, j) =>
                j === index
                  ? { ...comb, [name]: value }
                  : comb
              ),
            }
            : item
        )
      );
    }
  };

  const handleEdit = (item) => {
    setShow(true);
    setShowVariantList(true);
    setSelectedVariant(item?.variant_name);
    const seletedVariant = variationsData?.find(variation => variation.name === item.variant_name);
    setAttrValues((prv) => ({ ...prv, name: seletedVariant?.name, values: seletedVariant?.values }));
    setIsEdit(true);
  }

  const handleOffer = (item) => {
    setShow(true);
    setShowVariantList(true);
    setSelectedVariant(item?.variant_name);
    setSelectedVariations([...selectedVariations, item?.variant_name]);
    const options = item?.variant_attribute?.map((item) => item?.attribute_value);
    setAttrOptions(options);
  }

  console.log("drtfjhrthrhrhrhr", combinations,{variationsData});

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "15px"
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Customizations
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={
              {
                // width: "100%"
              }
            }
          >
            <FormControl>
              <FormLabel
                id="demo-radio-buttons-group-label"
                sx={{
                  fontWeight: "700",
                  color: "darkblue"
                }}
              >
                Does this product have customizations?
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="female"
                name="customization"
                value={formData.customization}
                onChange={formDataHandler}
              >
                <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="No" control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Popular Gifts
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={
              {
                // width: "100%"
              }
            }
          >
            <FormControl>
              <FormLabel
                id="demo-radio-buttons-group-label"
                sx={{
                  fontWeight: "700",
                  color: "darkblue"
                }}
              >
                Popular Gifts?
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="No"
                name="popularGifts"
                value={formData.popularGifts}
                onChange={formDataHandler}
              >
                <FormControlLabel
                  value="Yes"
                  control={<Radio checked={formData.popularGifts === "Yes"} />}
                  label="Yes"
                />
                <FormControlLabel
                  value="No"
                  control={<Radio checked={formData.popularGifts === "No"} />}
                  label="No"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Is the best selling product
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={
              {
                // width: "100%"
              }
            }
          >
            <FormControl>
              <FormLabel
                id="demo-radio-buttons-group-label"
                sx={{
                  fontWeight: "700",
                  color: "darkblue"
                }}
              >
                Is the best selling product?
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="No"
                name="bestSelling"
                value={formData.bestSelling}
                onChange={formDataHandler}
              >
                <FormControlLabel
                  value="Yes"
                  control={<Radio checked={formData.bestSelling === "Yes"} />}
                  label="Yes"
                />
                <FormControlLabel
                  value="No"
                  control={<Radio checked={formData.bestSelling === "No"} />}
                  label="No"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box>

        {/* <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Variant
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={
              {
                // width: "100%"
              }
            }
          >
            <FormControl>
              <FormLabel
                id="demo-radio-buttons-group-label"
                sx={{
                  fontWeight: "700",
                  color: "darkblue"
                }}
              >
                Variant?
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                // defaultValue={false}
                name="isCombination"
                value={formData.isCombination}
                onChange={formDataHandler}
              >
                <FormControlLabel
                  value="true"
                  control={<Radio checked={formData.isCombination === "true"} />}
                  label="Yes"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio checked={formData.isCombination === "false"} />}
                  label="No"
                />
              </RadioGroup>
            </FormControl>
          </Box>
        </Box> */}

        {/* gender */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Gender{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>{" "}
            :
          </Box>
          <Box width={"100%"}>
            <Autocomplete
              multiple
              limitTags={4}
              id="multiple-limit-tags"
              options={genderData}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label="Gender"
                    placeholder="Select Variant"
                    sx={{
                      width: "100%",
                      "& .MuiInputBase-root": {
                        height: "40px",
                        padding: "0 11px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                  />
                );
              }}
              onChange={varintHandler}
              defaultValue={EdtiFroemData?.gender ? formData.gender : []}
              value={formData.gender}
              name="variations"
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
          </Box>
        </Box>
        {/* end gender */}

        {/* style terms  */}

        <Box
          sx={{
            display: "flex",
            gap: "20px",
            position: "relative"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Search Terms
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box sx={{ width: "100%" }}>
            {/* <Autocomplete
              multiple
              freeSolo
              options={allTags || []}
              getOptionLabel={(option) => option.title}
              value={keys}
              onChange={handleChange}
              inputValue={formData.searchTerms}
              defaultValue={EdtiFroemData?.search_terms ? formData.searchTerms : []}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onInputChange={(e, newInputValue) => {
                setFormData((prev) => ({ ...prev, searchTerms: newInputValue }));
              }}
              renderTags={(value, getTagProps) =>
                value??.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    onDelete={handleDelete(option)}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Enter keys"
                  placeholder="Add key"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleAddKey();
                    }
                  }}
                />
              )}
            /> */}
            <Autocomplete
              multiple
              freeSolo
              options={allTags || []}
              getOptionLabel={(option) => (typeof option === "string" ? option : option.title)}
              value={keys}
              onChange={handleChange}
              inputValue={formData.searchTerms}
              defaultValue={EdtiFroemData?.search_terms ? formData.searchTerms : []}
              isOptionEqualToValue={(option, value) => {
                if (typeof option === "string" || typeof value === "string") {
                  return option === value;
                }
                return option._id === value._id;
              }}
              onBlur={() => {
                if (keys?.length <= 0) {
                  setError("Search Terms is Required");
                }
              }}
              onInputChange={(e, newInputValue) => {
                setFormData((prev) => ({ ...prev, searchTerms: newInputValue }));
                setError("");
              }}
              renderTags={(value, getTagProps) =>
                value?.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={typeof option === "string" ? option : option.title}
                    {...getTagProps({ index })}
                    onDelete={handleDelete(option)}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      // height: "40px",
                      padding: "0 11px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                  {...params}
                  variant="outlined"
                  label="Search Terms"
                  placeholder="Add Search Terms"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleAddKey();
                    }
                  }}
                />
              )}
            />
            {error && (
              <Typography
                sx={{
                  fontSize: "12px",
                  color: "#FF3D57",
                  marginLeft: "14px",
                  marginRight: "14px",
                  marginTop: "3px"
                }}
              >
                {error}
              </Typography>
            )}
          </Box>
        </Box>

        {/* end style name  */}

        {/* Size */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap",
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Size <HelpOutlineIcon sx={{ width: "15px" }} />:
          </Box>
          <Box width={"100%"}>
            <Autocomplete
              id="size-select"
              options={sizeOptions}
              getOptionLabel={(option) => option}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label="Size"
                    placeholder="Select Size"
                    sx={{
                      width: "100%",
                      "& .MuiInputBase-root": {
                        height: "40px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                  />
                );
              }}
              onChange={(event, value) => {
                formDataSingleSelect("productsize", value);
              }}
              value={formData.productsize}
              name="productsize"
            />
          </Box>
        </Box>
        {/* End Size */}

        {/* Size Map */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap",
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Size Map <HelpOutlineIcon sx={{ width: "15px" }} />:
          </Box>
          <Box width={"100%"}>
            <Autocomplete
              id="sizeMap-select"
              options={sizeMapOptions}
              getOptionLabel={(option) => option}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label="Size Map"
                    placeholder="Select Size Map"
                    sx={{
                      width: "100%",
                      "& .MuiInputBase-root": {
                        height: "40px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                  />
                );
              }}
              onChange={(event, value) => {
                formDataSingleSelect("productsizeMap", value);
              }}
              value={formData.productsizeMap}
              name="productsizeMap"
            />
          </Box>
        </Box>
        {/* End Size Map */}
        {/* color textarea */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap",
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Color <HelpOutlineIcon sx={{ width: "15px" }} /> :
          </Box>
          <Box
            sx={{
              width: "100%"
            }}
          >
            <TextField
              name="productcolor"
              label="Color"
              value={formData.productcolor}
              onChange={(e) => {
                formDataHandler(e);
              }}
              rows={4}
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  height: "40px"
                },
                "& .MuiFormLabel-root": {
                  top: "-7px"
                }
              }}
            />
          </Box>
        </Box>

        {/* end color textarea */}

        {/* color map */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap",
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Color Map <HelpOutlineIcon sx={{ width: "15px" }} /> :
          </Box>
          <Box width={"100%"}>
            <Autocomplete
              id="colorMap-select"
              options={colorOptionsMaps}
              getOptionLabel={(option) => option}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label="colorMap"
                    placeholder="Select colorMap"
                    sx={{
                      width: "100%",
                      "& .MuiInputBase-root": {
                        height: "40px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                  />
                );
              }}
              onChange={(event, value) => {
                formDataSingleSelect("colorMap", value);
              }}
              value={formData.colorMap}
              name="colorMap"
            />
          </Box>
        </Box>

        {/* end color map */}
        {/* style name  */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap",
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Style Name <HelpOutlineIcon sx={{ width: "15px" }} />:
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              value={formData.StyleName}
              name="StyleName"
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  height: "40px"
                },
                "& .MuiFormLabel-root": {
                  top: "-7px"
                }
              }}
              onChange={(e) => {
                formDataHandler(e);
              }}
              fullWidth
              label="Style Name"
              id="fullWidth"
            />
          </Box>
        </Box>

        {/* end style name  */}
        {/* launch data  */}

        {/* end launch date */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Launch Date{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            {/* <TextField fullWidth label="Search Terms" id="fullWidth" /> */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px"
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px"
                  }
                }}
                value={selectedLaunchDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {/* release date */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Release Date
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            {/* <TextField fullWidth label="Search Terms" id="fullWidth" /> */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Select Date"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px"
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px"
                  }
                }}
                value={selectedReleasDate}
                onChange={handleReleaseDateChange}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Box>
        </Box>

        {/* end release date */}
        {/* Shoping Weight */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Shopings Weight
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              display: "flex",
              gap: "20px"
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "100%"
              }}
            >
              <TextField
                value={formData.Shopingsweight}
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px"
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px"
                  }
                }}
                name="Shopingsweight"
                onChange={(e) => {
                  formDataHandler(e);
                }}
                fullWidth
                label="Shoping Weight"
                id="fullWidth"
              />
            </Box>
            <Box width={"100%"}>
              <Autocomplete
                id="productweight-select"
                options={shippingWeightOptions}
                getOptionLabel={(option) => option}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="weight"
                      placeholder="Select"
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-root": {
                          height: "40px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                    />
                  );
                }}
                sx={{ width: "100%" }}
                onChange={(event, value) => {
                  formDataSingleSelect("productweight", value);
                }}
                value={formData.productweight}
                name="productweight"
              />
            </Box>
          </Box>
        </Box>
        {/* end Shoping Weight */}
        {/* Item Display Dimension */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Item Display Dimenssion
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              {/* * */}
            </span>
            :
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            <Box
              sx={{
                width: "100%",
                maxWidth: "100%",
                display: "flex",
                gap: "20px"
              }}
            >
              {/* <TextField fullWidth label="Length" id="fullWidth" /> */}
              {/* DisplayDimenssionlength */}
              <Box width={"100%"}>
                <TextField
                  value={formData.DisplayDimenssionlength}
                  name="DisplayDimenssionlength"
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                  onChange={(e) => {
                    formDataHandler(e);
                  }}
                  fullWidth
                  label="Length"
                  id="fullWidth"
                />
              </Box>

              <Box
                width={"100%"}
                sx={{
                  display: "flex",
                  gap: "20px"
                }}
              >
                {/* <TextField fullWidth label="Width" id="fullWidth" /> */}
                <Box width={"100%"}>
                  <TextField
                    value={formData.DisplayDimenssionwidth}
                    name="DisplayDimenssionwidth"
                    sx={{
                      width: "100%",
                      "& .MuiInputBase-root": {
                        height: "40px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                    onChange={(e) => {
                      formDataHandler(e);
                    }}
                    fullWidth
                    label="Width"
                    id="fullWidth"
                  />
                </Box>
              </Box>
              <Box
                width={"100%"}
                sx={{
                  display: "flex",
                  gap: "20px"
                }}
              >
                {/* <TextField fullWidth label="Heigth" id="fullWidth" /> */}
                <Box width={"100%"}>
                  <TextField
                    value={formData.DisplayDimenssionheight}
                    name="DisplayDimenssionheight"
                    sx={{
                      width: "100%",
                      "& .MuiInputBase-root": {
                        height: "40px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                    onChange={(e) => {
                      formDataHandler(e);
                    }}
                    fullWidth
                    label="Height"
                    id="fullWidth"
                  />
                </Box>
              </Box>
              <Box width={"100%"}>
                <Autocomplete
                  id="productunitValue-select"
                  options={unitValueOptions}
                  getOptionLabel={(option) => option}
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        label="Unit Value"
                        placeholder="Angstrom"
                        sx={{
                          width: "100%",
                          "& .MuiInputBase-root": {
                            height: "40px"
                          },
                          "& .MuiFormLabel-root": {
                            top: "-7px"
                          }
                        }}
                      />
                    );
                  }}
                  onChange={(event, value) => {
                    formDataSingleSelect("productunitValue", value);
                  }}
                  value={formData.productunitValue}
                  name="productunitValue"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* end Item Display Dimension */}
        {/* Package Dimenssion */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Package Dimenssion
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            <Box
              sx={{
                width: "100%",
                maxWidth: "100%",
                display: "flex",
                gap: "20px"
              }}
            >
              {/* <TextField fullWidth label="Package Height" id="fullWidth" /> */}
              <Box width={"100%"}>
                <TextField
                  value={formData.PackageDimenssionheight}
                  name="PackageDimenssionheight"
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                  onChange={(e) => {
                    formDataHandler(e);
                  }}
                  fullWidth
                  label="Height"
                  id="fullWidth"
                />
              </Box>

              {/* <TextField fullWidth label=" Packege Length" id="fullWidth" /> */}
              <Box width={"100%"}>
                <TextField
                  value={formData.PackageDimenssionlength}
                  name="PackageDimenssionlength"
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                  onChange={(e) => {
                    formDataHandler(e);
                  }}
                  fullWidth
                  label="Length"
                  id="fullWidth"
                />
              </Box>

              {/* <TextField fullWidth label=" Packege Heigth" id="fullWidth" /> */}
              <Box width={"100%"}>
                <TextField
                  value={formData.PackageDimenssionwidth}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                  name="PackageDimenssionwidth"
                  onChange={(e) => {
                    formDataHandler(e);
                  }}
                  fullWidth
                  label="Width"
                  id="fullWidth"
                />
              </Box>

              {/* <TextField fullWidth label=" Packege Heigth" id="fullWidth" /> */}
              <Box width={"100%"}>
                {/* <TextField
                  value={formData.PackageDimenssionUnit}
                  name="PackageDimenssionUnit"
                  onChange={(e) => {
                    formDataHandler(e);
                  }}
                  fullWidth
                  label="Unit"
                  id="fullWidth"
                /> */}

                <Autocomplete
                  id="productunitValue-selects"
                  options={PackageDimenssion}
                  getOptionLabel={(option) => option}
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        label="Unit Value"
                        placeholder="Angstrom"
                        sx={{
                          width: "100%",
                          "& .MuiInputBase-root": {
                            height: "40px"
                          },
                          "& .MuiFormLabel-root": {
                            top: "-7px"
                          }
                        }}
                      />
                    );
                  }}
                  onChange={(event, value) => {
                    formDataSingleSelect("PackageDimenssionUnit", value);
                  }}
                  value={formData.PackageDimenssionUnit}
                  name="productunitValue"
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* end  Package Dimenssion */}
        {/* Package Dimenssion Weight */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Package Weight
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              display: "flex",
              gap: "20px"
            }}
          >
            {/* <TextField fullWidth label="0.0" id="fullWidth" /> */}
            <Box
              sx={{
                width: "100%",
                maxWidth: "100%"
              }}
            >
              <TextField
                value={formData.packageWidth}
                name="packageWidth"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-root": {
                    height: "40px"
                  },
                  "& .MuiFormLabel-root": {
                    top: "-7px"
                  }
                }}
                onChange={(e) => {
                  formDataHandler(e);
                }}
                fullWidth
                label="0.0"
                id="fullWidth"
              />
            </Box>
            {/* <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Age</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={age}
                label="Age"
                onChange={handleChange}
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl> */}

            <Box width={"100%"}>
              <Autocomplete
                id="packageweight-select"
                options={packageunitValues}
                getOptionLabel={(option) => option}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="weight"
                      placeholder="Select"
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-root": {
                          height: "40px"
                        },
                        "& .MuiFormLabel-root": {
                          top: "-7px"
                        }
                      }}
                    />
                  );
                }}
                sx={{ width: "100%" }}
                onChange={(event, value) => {
                  formDataSingleSelect("packageweight", value);
                }}
                value={formData.packageweight}
                name="packageweight"
              />
            </Box>
          </Box>
        </Box>
        {/* end Package Dimenssion Weight */}
        {/* unit count  */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Unit Count
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              value={formData.productcateUnitCount}
              name="productcateUnitCount"
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  height: "40px"
                },
                "& .MuiFormLabel-root": {
                  top: "-7px"
                }
              }}
              onChange={(e) => {
                formDataHandler(e);
              }}
              fullWidth
              label="Unit Count"
              id="fullWidth"
            />
          </Box>
        </Box>

        {/* end unit count  */}
        {/* Unit Count type */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Unit Count type
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              value={formData.productcateUnitCounttypeee}
              name="productcateUnitCounttypeee"
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  height: "40px"
                },
                "& .MuiFormLabel-root": {
                  top: "-7px"
                }
              }}
              onChange={(e) => {
                formDataHandler(e);
              }}
              fullWidth
              label="Unit Count type"
              id="fullWidth"
            />
          </Box>
        </Box>
        {/* end Unit Count type */}
        {/* how are you product made */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            How Are You Prouduct Made?{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>{" "}
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              value={formData.HowAreYouProuduct}
              name="HowAreYouProuduct"
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  height: "40px"
                },
                "& .MuiFormLabel-root": {
                  top: "-7px"
                }
              }}
              onChange={(e) => {
                formDataHandler(e);
              }}
              fullWidth
              label="How Are You Prouduct Made ?"
              id="fullWidth"
            />
          </Box>
        </Box>
        {/* how are you product made */}

        {/* ocassion start */}

        {/* gender */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Occassion
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box width={"100%"}>
            <Autocomplete
              multiple
              limitTags={4}
              id="multiple-limit-tags"
              options={OccassionList}
              getOptionLabel={(option) => option?.title}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Occasion"
                  placeholder="Select Variant"
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px",
                      padding: "0 11px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                />
              )}
              value={formData.productdetailsOccassion}
              onChange={varintHandlerOcattion}
              defaultValue={EdtiFroemData?.occasion ? formData.productdetailsOccassion : []}
              name="productdetailsOccassion"
              isOptionEqualToValue={(option, value) => option?._id === value?._id}
            />
          </Box>
        </Box>
        {/* end gender */}

        {/* end ocassion  */}

        {/* desing startttt */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap"
            }}
          >
            Design
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
            </span>
            :
          </Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%"
            }}
          >
            <TextField
              value={formData.productdetailsDesign}
              name="productdetailsDesign"
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  height: "40px"
                },
                "& .MuiFormLabel-root": {
                  top: "-7px"
                }
              }}
              onChange={(e) => {
                formDataHandler(e);
              }}
              fullWidth
              label="Design"
              id="fullWidth"
            />
          </Box>
        </Box>
        {/* end  desing startttt */}

        {/* material start */}

        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap",
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Material <HelpOutlineIcon sx={{ width: "15px" }} />:
          </Box>
          <Box width={"100%"}>
            <Autocomplete
              multiple
              limitTags={4}
              id="multiple-limit-tags"
              options={combinedMaterials}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label="Material "
                    placeholder="Select Material "
                    sx={{
                      width: "100%",
                      "& .MuiInputBase-root": {
                        // height: "40px",
                        padding: "0 11px"
                      },
                      "& .MuiFormLabel-root": {
                        top: "-7px"
                      }
                    }}
                  />
                );
              }}
              // onChange={varintHandler}
              onChange={handlevarintHandler}
              value={formData.combinedMaterials}
              // defaultValue={formData.combinedMaterials}
              defaultValue={EdtiFroemData?.material ? formData.combinedMaterials : []}
              name="variations"
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
          </Box>
        </Box>

        {/* end material enddd */}
        <Box
          sx={{
            display: "flex",
            gap: "20px"
          }}
        >
          <Box
            sx={{
              fontSize: "14px",
              fontWeight: 700,
              wordBreak: "normal",
              width: "15%",
              textOverflow: "ellipsis",
              display: "flex",
              textWrap: "wrap",
              textAlign: "center",
              display: "flex",
              gap: "3px"
            }}
          >
            Variations <HelpOutlineIcon sx={{ width: "15px" }} />:
          </Box>
          <Box width={"100%"}>
            <Button variant="outlined" onClick={handleOpenVariant}>
              + Add Variations
            </Button>
          </Box>
        </Box>
        {combinations?.length > 0 && (
          combinations?.map((comb, combindex) => (
            <Box key={combindex}>
              <Typography variant="h6">
                {comb.variant_name}
              </Typography>
              <Typography mb={3}>{combinations.length} variants</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          wordBreak: "keep-all"
                        }}
                        align="center"
                      >
                        S.No
                      </TableCell>
                      {
                        comb.combinations[0]?.name1 && 
                        <TableCell
                          sx={{
                            wordBreak: "keep-all"
                          }}
                          align="center"
                        >
                          {comb.combinations[0]?.name1}
                        </TableCell>
                      }
                      {
                        comb.combinations[0]?.name2 && 
                        <TableCell
                          sx={{
                            wordBreak: "keep-all"
                          }}
                          align="center"
                        >
                          {comb.combinations[0]?.name2}
                        </TableCell>
                      }
                        <TableCell
                            sx={{
                                wordBreak: "keep-all"
                            }}
                            align="center"
                        >
                            Main Image 1
                        </TableCell>
                        <TableCell
                            sx={{
                                wordBreak: "keep-all"
                            }}
                            align="center"
                        >
                            Main Image 2
                        </TableCell>
                        <TableCell
                            sx={{
                                wordBreak: "keep-all"
                            }}
                            align="center"
                        >
                            Main Image 3
                        </TableCell>
                        <TableCell
                            sx={{
                                wordBreak: "keep-all"
                            }}
                            align="center"
                        >
                            Preview
                        </TableCell>
                        <TableCell
                            sx={{
                                wordBreak: "keep-all"
                            }}
                            align="center"
                        >
                            Thumbnail
                        </TableCell>
                      {(variationsData.length >= 2 ? formValues?.prices === comb.variant_name : true)  && formValues?.isCheckedPrice && (
                        <TableCell
                          sx={{
                            wordBreak: "keep-all"
                          }}
                          align="center"
                        >
                          Price in India
                        </TableCell>
                      )}
                      {(variationsData.length >= 2 ? formValues?.quantities === comb.variant_name : true) && formValues?.isCheckedQuantity && (
                        <TableCell
                          sx={{
                            wordBreak: "keep-all"
                          }}
                          align="center"
                        >
                          Quantity
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          wordBreak: "keep-all"
                        }}
                        align="center"
                      >
                        Visible
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      <TableRowComponent
                          comb={comb}
                          handleCombChange={handleCombChange}
                          handleToggle={handleToggle}
                          combindex={combindex}
                          formValues={formValues}
                          variationsData={variationsData}
                          combinationError={combinationError}
                          setCombinationError={setCombinationError}
                          handleImageUpload={handleImageUpload}
                          handleImageRemove={handleImageRemove}
                          showAll={showAll}
                          setShowAll={setShowAll}
                      />
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        )}

        {/*  varient Attribute  */}
        {
          varientName?.map((item) => {
            const titlevalue = item?.variant_attribute?.map((res) => {
              return { label: res?.attribute_value, _id: res?._id };
            });
            const seletedVariant = variationsData?.find(variation => variation.name === item.variant_name);
            // console.log("sizeOptionssizeOptions", item.id);
            return (
              <>
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    gap: "20px"
                  }}
                // onClick={() => handleClickMainID(item?.id)}
                >
                  <Box
                    sx={{
                      fontSize: "14px",
                      fontWeight: 700,
                      wordBreak: "normal",
                      width: "15%",
                      textOverflow: "ellipsis",
                      display: "flex",
                      textWrap: "wrap",
                      textAlign: "center",
                      display: "flex",
                      gap: "3px"
                    }}
                  >
                    {item.variant_name} <HelpOutlineIcon sx={{ width: "15px" }} />:
                  </Box>
                  <Box width="100%">
                    {seletedVariant?.name ? (
                      <Box
                        sx={{
                          fontSize: "14px",
                          fontWeight: 700,
                          wordBreak: "normal",
                          width: "100%",
                          textOverflow: "ellipsis",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Offering {seletedVariant?.values?.length} options
                        <Button
                          sx={{
                            padding: "5px 10px",
                            background: "lightblue",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: "4px",
                            minWidth: "unset",
                            fontSize: "12px",
                          }}
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <Autocomplete
                          id={`size-select-${item.id}`}
                          options={item?.variant_attribute || []} 
                          getOptionLabel={(option) => option.attribute_value || ''}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={item?.variant_name?.toUpperCase() || 'Select Variant'} 
                              placeholder="Select Size"
                            />
                          )}
                          sx={{ width: "100%" }}
                          onChange={(event, value) => handleVariantChange(item.id, value)}
                          value={
                            item?.variant_attribute?.find((option) =>
                              formData?.varientName?.includes(option._id)
                            ) || null
                          }
                          name="variantName"
                        />
                        {
                          variationsData?.length < 3 && <Box
                            sx={{
                              fontSize: "14px",
                              fontWeight: 700,
                              wordBreak: "normal",
                              width: "15%",
                              textOverflow: "ellipsis",
                              textAlign: "center",
                              display: "flex",
                              gap: "3px",
                              cursor: "pointer",
                              flexWrap: "wrap",
                            }}
                            onClick={() => handleOffer(item)}
                          >
                            Offer more than one
                          </Box>
                        }
                      </>
                    )}
                  </Box>
                </Box>
              </>
            );
          })
        }
        {/* end varient Attribute */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: "20px"
          }}
        >
          {/* <div>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#d32f2f"
              }}
            >
              Cancel
            </Button>
          </div> */}
          <Box
            sx={{
              display: "flex",
              gap: "5px"
            }}
          >
            <Button
              endIcon={draftLoading ? <CircularProgress size={15} /> : ""}
              disabled={draftLoading}
              onClick={handleDraftProduct}
              variant="contained"
            >
              Save As Draft
            </Button>
            {/* <Button variant="contained">Save as Draft</Button> */}
            <Button onClick={addProducthandler} variant="contained">
              Next
            </Button>

            {queryId ? (
              <Button
                endIcon={loading ? <CircularProgress size={15} /> : ""}
                disabled={loading}
                onClick={EditProducthandler}
                variant="contained"
              >
                Submit
              </Button>
            ) : (
              ""
            )}
          </Box>
        </Box>
      </Box>
      <VariantModal
        show={show}
        varientName={varientName}
        handleCloseVariant={handleCloseVariant}
        combinations={combinations}
        setCombinations={setCombinations}
        setFormData={setFormData}
        formValues={formValues}
        setFormValues={setFormValues}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        showVariantList={showVariantList}
        setShowVariantList={setShowVariantList}
        attrValues={attrValues}
        setAttrValues={setAttrValues}
        attrOptions={attrOptions}
        setAttrOptions={setAttrOptions}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        variationsData={variationsData}
        setVariationsData={setVariationsData}
        selectedVariations={selectedVariations}
        setSelectedVariations={setSelectedVariations}
      />
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default CustomisationTabs;
