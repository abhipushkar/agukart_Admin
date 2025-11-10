// components/ParentProduct/FormFields/TextFormField.jsx
import React from 'react';
import { Box, TextField } from '@mui/material';

const TextFormField = ({
                           label,
                           name,
                           value,
                           onChange,
                           onBlur,
                           error,
                           helperText,
                           required = false,
                           multiline = false,
                           rows = 1,
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
                <TextField
                    error={!!error}
                    helperText={helperText}
                    sx={{
                        mb: 2,
                        "& .MuiInputBase-root": {
                            height: multiline ? "auto" : "40px"
                        },
                        "& .MuiFormLabel-root": {
                            top: "-7px"
                        }
                    }}
                    onBlur={onBlur}
                    value={value}
                    name={name}
                    onChange={onChange}
                    fullWidth
                    label={label}
                    multiline={multiline}
                    rows={rows}
                    {...props}
                />
            </Box>
        </Box>
    );
};

export default TextFormField;
