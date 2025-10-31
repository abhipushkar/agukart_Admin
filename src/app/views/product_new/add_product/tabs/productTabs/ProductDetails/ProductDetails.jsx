import {
    Box,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Autocomplete,
    Chip,
    Typography,
    Button,
    IconButton,
    Grid
} from "@mui/material";
import {LocalizationProvider, DatePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useProductFormStore} from "../../../../states/useAddProducts";
import {useState, useEffect, useRef} from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ProductDetails() {
    const {
        formData,
        setFormData,
        dynamicFields
    } = useProductFormStore();
    const [allTags, setAllTags] = useState([]);
    const [error, setError] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(true);
    const searchTermsRef = useRef(null);

    useEffect(() => {
        if (dynamicFields.length === 0) {
            setFormData({dynamicFields: {}});
        }
    }, [dynamicFields]);

    const formDataHandler = (e) => {
        setFormData({[e.target.name]: e.target.value});
    };

    const handleChange = (event, newKeys) => {
        const titles = newKeys?.map((option) => (typeof option === "string" ? option : option.title));
        setFormData({serchTemsKeyArray: titles});
        setError("");
    };

    const handleAddKey = () => {
        if (formData.searchTerms.trim() && !formData.serchTemsKeyArray.includes(formData.searchTerms.trim())) {
            const newKey = formData.searchTerms.trim();
            setFormData({serchTemsKeyArray: [...formData.serchTemsKeyArray, newKey]});
        }
    };

    const handleDelete = (keyToDelete) => () => {
        const updatedKeys = formData.serchTemsKeyArray.filter((k) => k !== keyToDelete);
        setFormData({serchTemsKeyArray: updatedKeys});
    };

    const handleDateChange = (dateType) => (newDate) => {
        setFormData({[dateType]: newDate});
    };

    const handleDynamicFieldChange = (fieldName, value) => {
        setFormData({
            dynamicFields: {
                ...formData.dynamicFields,
                [fieldName]: value
            }
        });
    };

    const handleCompoundFieldChange = (parentFieldName, subFieldName, value, index = 0) => {
        const fieldKey = `${parentFieldName}.${subFieldName}`;
        setFormData({
            dynamicFields: {
                ...formData.dynamicFields,
                [fieldKey]: value
            }
        });
    };

    const addCompoundInstance = (parentFieldName) => {
        const currentInstances = formData.dynamicFields?.[`${parentFieldName}_instances`] || 0;
        setFormData({
            dynamicFields: {
                ...formData.dynamicFields,
                [`${parentFieldName}_instances`]: currentInstances + 1
            }
        });
    };

    const removeCompoundInstance = (parentFieldName, index) => {
        const currentInstances = formData.dynamicFields?.[`${parentFieldName}_instances`] || 0;
        if (currentInstances > 0) {
            // Remove all subfields for this instance
            const updatedDynamicFields = {...formData.dynamicFields};
            Object.keys(updatedDynamicFields).forEach(key => {
                if (key.startsWith(`${parentFieldName}[${index}]`)) {
                    delete updatedDynamicFields[key];
                }
            });
            updatedDynamicFields[`${parentFieldName}_instances`] = currentInstances - 1;
            setFormData({dynamicFields: updatedDynamicFields});
        }
    };

    const getCompoundInstances = (parentFieldName) => {
        return formData.dynamicFields?.[`${parentFieldName}_instances`] || 1;
    };

    // Calculate search terms width based on number of chips
    const getSearchTermsWidth = () => {
        const chipCount = formData.serchTemsKeyArray?.length || 0;
        if (!isSearchFocused && chipCount > 0) {
            return "100%";
        }
        if (chipCount === 0) return "50%";
        if (chipCount <= 2) return "60%";
        if (chipCount <= 4) return "75%";
        return "100%";
    };

    // Custom renderTags function for search terms
    const renderSearchTags = (value, getTagProps) => {
        if (!isSearchFocused && value.length > 3) {
            // Show first 3 chips and "+X more" indicator
            const visibleChips = value.slice(0, 3);
            const remainingCount = value.length - 3;

            return (
                <>
                    {visibleChips.map((option, index) => (
                        <Chip
                            variant="outlined"
                            label={typeof option === "string" ? option : option.title}
                            {...getTagProps({index})}
                            onDelete={handleDelete(option)}
                            size="small"
                        />
                    ))}
                    {remainingCount > 0 && (
                        <Chip
                            label={`+${remainingCount} more`}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{cursor: 'pointer'}}
                            onClick={() => setIsSearchFocused(true)}
                        />
                    )}
                </>
            );
        }

        // Show all chips when focused
        return value.map((option, index) => (
            <Chip
                variant="outlined"
                label={typeof option === "string" ? option : option.title}
                {...getTagProps({index})}
                onDelete={handleDelete(option)}
                size="small"
            />
        ));
    };

    // Custom renderTags function for dynamic fields dropdowns
    const renderDynamicTags = (value, getTagProps) => {
        if (value?.length > 6) {
            const visibleChips = value.slice(0, 6);
            const remainingCount = value.length - 6;

            return (
                <>
                    {visibleChips.map((option, index) => (
                        <Chip
                            label={option}
                            {...getTagProps({index})}
                            size="small"
                        />
                    ))}
                    {remainingCount > 0 && (
                        <Chip
                            label={`+${remainingCount}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                        />
                    )}
                </>
            );
        }

        return value?.map((option, index) => (
            <Chip
                label={option}
                {...getTagProps({index})}
                size="small"
            />
        ));
    };

    const renderDynamicField = (field) => {
        if (!field.status) return null;

        switch (field.type) {
            case "Text":
                return (
                    <TextField
                        label={field.name}
                        value={formData.dynamicFields?.[field.name] || ""}
                        onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                        sx={{
                            width: "50%",
                            "& .MuiInputBase-root": {height: "40px"},
                            "& .MuiFormLabel-root": {top: "-7px"}
                        }}
                    />
                );

            case "Number":
                return (
                    <TextField
                        fullWidth
                        type="number"
                        label={field.name}
                        value={formData.dynamicFields?.[field.name] || ""}
                        onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                        sx={{
                            width: "50%",
                            "& .MuiInputBase-root": {height: "40px"},
                            "& .MuiFormLabel-root": {top: "-7px"}
                        }}
                    />
                );

            case "Yes/No":
                return (
                    <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend">{field.name}</FormLabel>
                        <RadioGroup
                            row
                            value={formData.dynamicFields?.[field.name] || ""}
                            onChange={(e) => handleDynamicFieldChange(field.name, e.target.value)}
                        >
                            <FormControlLabel value="Yes" control={<Radio/>} label="Yes"/>
                            <FormControlLabel value="No" control={<Radio/>} label="No"/>
                        </RadioGroup>
                    </FormControl>
                );

            case "Dropdown":
                return (
                    <Autocomplete
                        multiple={field.multiSelect || false}
                        disableCloseOnSelect={field.multiSelect}
                        options={field.values?.filter(item => item.status !== false).map(item => item.value) || []}
                        value={formData.dynamicFields?.[field.name] || (field.multiSelect ? [] : null)}
                        sx={{
                            width: "70%",
                        }}
                        onChange={(event, newValue) => handleDynamicFieldChange(field.name, newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={field.name}
                                sx={{
                                    "& .MuiInputBase-root": {
                                        height: field.multiSelect ? "auto" : "40px",
                                        minHeight: "40px",
                                        padding: "0 11px"
                                    },
                                    "& .MuiFormLabel-root": {
                                        top: "-7px"
                                    }
                                }}
                            />
                        )}
                        renderTags={renderDynamicTags}
                    />
                );

            case "Compound":
                const instances = getCompoundInstances(field.name);
                return (
                    Array.from({length: instances}).map((_, instanceIndex) => (
                        <Box key={instanceIndex} sx={{
                            border: "1px solid #ddd",
                            p: 2,
                            borderRadius: 1,
                            mb: 2,
                            bgcolor: "white",
                            position: "relative"
                        }}>
                            <Grid container spacing={4} sx={{}}>
                                {field.subAttributes?.map((subField, subIndex) => (
                                    <Grid item sm={6} key={subIndex} sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.2,
                                        alignItems: "start"
                                    }}>
                                        <Box sx={{width: "100%"}}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {subField.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{width: "100%"}}>
                                            {renderSubField(subField, field.name, instanceIndex)}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))
                );

            default:
                return null;
        }
    };

    const renderSubField = (subField, parentFieldName, instanceIndex = 0) => {
        const fieldKey = `${parentFieldName}.${subField.name}`;
        const value = formData.dynamicFields?.[fieldKey];

        switch (subField.type) {
            case "Text":
                return (
                    <TextField
                        fullWidth
                        size="small"
                        value={value || ""}
                        onChange={(e) => handleCompoundFieldChange(parentFieldName, subField.name, e.target.value, instanceIndex)}
                        placeholder={`Enter ${subField.name}`}
                    />
                );

            case "Number":
                return (
                    <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={value || ""}
                        onChange={(e) => handleCompoundFieldChange(parentFieldName, subField.name, e.target.value, instanceIndex)}
                        placeholder={`Enter ${subField.name}`}
                    />
                );

            case "Yes/No":
                return (
                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            row
                            value={value || ""}
                            onChange={(e, value) => handleCompoundFieldChange(parentFieldName, subField.name, value, instanceIndex)}
                        >
                            <FormControlLabel value="Yes" control={<Radio size="small"/>} label="Yes"/>
                            <FormControlLabel value="No" control={<Radio size="small"/>} label="No"/>
                        </RadioGroup>
                    </FormControl>
                );

            case "Dropdown":
                return (
                    <Autocomplete
                        multiple={subField.multiSelect || false}
                        disableCloseOnSelect={subField.multiSelect}
                        options={subField.values?.map(item => item.value) || []}
                        value={value || (subField.multiSelect ? [] : null)}
                        onChange={(event, newValue) =>
                            handleCompoundFieldChange(parentFieldName, subField.name, newValue, instanceIndex)
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                placeholder={`Select ${subField.name}`}
                            />
                        )}
                        renderTags={renderDynamicTags}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: "15px", maxWidth: "1200px", mx: "auto"}}>
            <Box sx={{mt: 4}}>
                {/* Customizations */}
                <Box sx={{display: "flex", gap: "20px", mb: 3}}>
                    <Box sx={{fontSize: "14px", fontWeight: 700, width: "12.8%", display: "flex", textWrap: "wrap"}}>
                        Customizations

                    </Box>
                    <Box sx={{width: "87.2%"}}>
                        <FormControl>
                            <FormLabel sx={{fontWeight: "700", color: "darkblue"}}>
                                Does this product have customizations?
                            </FormLabel>
                            <RadioGroup
                                name="customization"
                                value={formData.customization}
                                onChange={formDataHandler}
                                row
                            >
                                <FormControlLabel value="Yes" control={<Radio/>} label="Yes"/>
                                <FormControlLabel value="No" control={<Radio/>} label="No"/>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Box>

                {/* Popular Gifts */}
                <Box sx={{display: "flex", gap: "20px", mb: 3}}>
                    <Box sx={{fontSize: "14px", fontWeight: 700, width: "12.8%", display: "flex", textWrap: "wrap"}}>
                        Popular Gifts

                    </Box>
                    <Box sx={{width: "87.2%"}}>
                        <FormControl>
                            <FormLabel sx={{fontWeight: "700", color: "darkblue"}}>
                                Popular Gifts?
                            </FormLabel>
                            <RadioGroup
                                name="popularGifts"
                                value={formData.popularGifts}
                                onChange={formDataHandler}
                                row
                            >
                                <FormControlLabel value="Yes" control={<Radio/>} label="Yes"/>
                                <FormControlLabel value="No" control={<Radio/>} label="No"/>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Box>

                {/* Best Selling Product */}
                <Box sx={{display: "flex", gap: "20px", mb: 3}}>
                    <Box sx={{fontSize: "14px", fontWeight: 700, width: "12.8%", display: "flex", textWrap: "wrap"}}>
                        Is the best selling product

                    </Box>
                    <Box sx={{width: "87.2%"}}>
                        <FormControl>
                            <FormLabel sx={{fontWeight: "700", color: "darkblue"}}>
                                Is the best selling product?
                            </FormLabel>
                            <RadioGroup
                                name="bestSelling"
                                value={formData.bestSelling}
                                onChange={formDataHandler}
                                row
                            >
                                <FormControlLabel value="Yes" control={<Radio/>} label="Yes"/>
                                <FormControlLabel value="No" control={<Radio/>} label="No"/>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Box>
            </Box>

            {/* Dynamic Fields Section */}
            {dynamicFields.length > 0 && (
                <Box sx={{mt: 2}}>
                    <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
                        {dynamicFields.map((field, index) => (
                            <Box key={index} sx={{
                                display: "flex",
                                gap: "20px",
                                alignItems: field.type === "Compound" ? "flex-start" : "center"
                            }}>
                                <Box sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    width: "15%",
                                    display: "flex",
                                    textWrap: "wrap",
                                    mt: field.type === "Compound" ? 1 : 0
                                }}>
                                    {field.name}
                                    {/*{field.viewOnProductPage && (*/}
                                    {/*    <span style={{color: "red", fontSize: "15px", margin: "0 3px"}}>*</span>*/}
                                    {/*)}*/}
                                    :
                                </Box>
                                <Box sx={{width: "85%"}}>
                                    {renderDynamicField(field)}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Static Fields Section */}
            <Box sx={{mt: 4}}>
                {/* Launch Date */}
                <Box sx={{display: "flex", gap: "20px", mb: 3}}>
                    <Box sx={{fontSize: "14px", fontWeight: 700, width: "15%", display: "flex", textWrap: "wrap"}}>
                        Launch Date

                    </Box>
                    <Box sx={{width: "25%"}}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Select Launch Date"
                                sx={{
                                    width: "100%",
                                    "& .MuiInputBase-root": {height: "40px"},
                                    "& .MuiFormLabel-root": {top: "-7px"}
                                }}
                                value={formData.launchData}
                                onChange={handleDateChange("launchData")}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </Box>
                </Box>

                {/* Release Date */}
                <Box sx={{display: "flex", gap: "20px", mb: 3}}>
                    <Box sx={{fontSize: "14px", fontWeight: 700, width: "15%", display: "flex", textWrap: "wrap"}}>
                        Release Date

                    </Box>
                    <Box sx={{width: "25%"}}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Select Release Date"
                                sx={{
                                    width: "100%",
                                    "& .MuiInputBase-root": {height: "40px"},
                                    "& .MuiFormLabel-root": {top: "-7px"}
                                }}
                                value={formData.releaseDate}
                                onChange={handleDateChange("releaseDate")}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider>
                    </Box>
                </Box>

                {/* Search Terms */}
                <Box sx={{display: "flex", gap: "20px", position: "relative", mb: 3}}>
                    <Box sx={{fontSize: "14px", fontWeight: 700, width: "15%", display: "flex", textWrap: "wrap"}}>
                        Search Terms

                    </Box>
                    <Box sx={{width: "85%"}}>
                        <Autocomplete
                            multiple
                            freeSolo
                            options={allTags || []}
                            getOptionLabel={(option) => (typeof option === "string" ? option : option.title)}
                            value={formData.serchTemsKeyArray}
                            sx={{
                                width: "70%",
                                transition: 'width 0.3s ease-in-out',
                            }}
                            onChange={handleChange}
                            inputValue={formData.searchTerms}
                            // onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => {
                                // setIsSearchFocused(false);
                                // if (formData.serchTemsKeyArray?.length <= 0) {
                                //     setError("Search Terms is Required");
                                // }
                            }}
                            onInputChange={(e, newInputValue) => {
                                setFormData({searchTerms: newInputValue});
                                setError("");
                            }}
                            renderTags={renderSearchTags}
                            renderInput={(params) => (
                                <TextField
                                    sx={{
                                        width: "100%",
                                        "& .MuiInputBase-root": {padding: "0 11px"},
                                        "& .MuiFormLabel-root": {top: "-7px"}
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
                            <Typography sx={{fontSize: "12px", color: "#FF3D57", ml: "14px", mr: "14px", mt: "3px"}}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
