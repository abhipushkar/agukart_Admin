// components/ParentProduct/FormFields/SelectFormField.jsx
import React from 'react';
import { Box, FormControl, TextField, MenuItem } from '@mui/material';

const SelectFormField = ({
                             label,
                             value,
                             onChange,
                             options = [],
                             error,
                             helperText,
                             required = false,
                             ...props
                         }) => {
    return (
        <Box sx={{ display: "flex", gap: "20px" }}>
            <Box sx={{
                fontSize: "14px",
                fontWeight: 700,
                wordBreak: "normal",
                width: "15%",
                textOverflow: "ellipsis",
                display: "flex",
                textWrap: "wrap"
            }}>
                {label}
                {required && (
                    <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>
                )}
                :
            </Box>
            <Box sx={{ width: "100%" }}>
                <FormControl fullWidth>
                    <TextField
                        select
                        error={!!error}
                        sx={{
                            "& .MuiInputBase-root": {
                                height: "40px"
                            },
                            "& .MuiFormLabel-root": {
                                top: "-7px"
                            }
                        }}
                        helperText={helperText}
                        value={value}
                        label={label}
                        onChange={onChange}
                        {...props}
                    >
                        {options.map((option) => (
                            <MenuItem key={option._id} value={option._id}>
                                {option.title}
                            </MenuItem>
                        ))}
                    </TextField>
                </FormControl>
            </Box>
        </Box>
    );
};

export default SelectFormField;
