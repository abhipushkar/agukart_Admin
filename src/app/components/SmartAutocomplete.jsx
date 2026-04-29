import React, { useState } from "react";
import { Autocomplete, TextField, Chip, Typography } from "@mui/material";

const SmartAutocomplete = ({
    value = [],
    onChange,
    options = [],
    label = "",
    placeholder = "",
    error = "",

    // behavior flags
    freeSolo = true,
    multiple = true,
    allowComma = true,
    allowEnter = true,
    allowBackspace = true,
    splitOnPaste = true,
    showChips = true,
    splitOnConfirmOnly = true,

    // customization
    getOptionLabel = (option) =>
        typeof option === "string" ? option : option?.label || "",
    isOptionEqualToValue = (opt, val) =>
        getOptionLabel(opt) === getOptionLabel(val),

    // pass-through props
    autocompleteProps = {},
    textFieldProps = {},
}) => {

    const [inputValue, setInputValue] = useState("");

    const parseTerm = (term) => {
        if (Array.isArray(term)) return term;

        if (typeof term === "string") {
            return term.split(",").map(t => t.trim()).filter(Boolean);
        }

        return [];
    };

    // 🔹 Normalize values
    const normalizeValues = (arr) => {
        return [
            ...new Set(
                arr
                    .flatMap((v) =>
                        typeof v === "string"
                            ? v.split(/[\s,]+/)
                            : [v]
                    )
                    .map((v) => (typeof v === "string" ? v.trim() : v))
                    .filter(Boolean)
            ),
        ];
    };

    // 🔹 Add input manually (Enter / comma / blur)
    const handleAddInput = (rawValue) => {
        const valueToUse = rawValue ?? inputValue;

        if (!valueToUse?.trim()) return;

        let newValues;

        if (splitOnConfirmOnly) {
            newValues = [
                ...value,
                ...parseTerm(valueToUse)
            ];
        } else {
            newValues = normalizeValues([...value, valueToUse]);
        }

        onChange([...new Set(newValues)]);
        setInputValue("");
    };

    // 🔹 Autocomplete change
    const handleChange = (event, newValue) => {
        let processed;

        if (splitOnConfirmOnly) {
            processed = newValue.reduce((acc, option) => {
                if (typeof option === "object") {
                    return acc.concat(getOptionLabel(option));
                }
                return acc.concat(option);
            }, []);
        } else {
            processed = normalizeValues(newValue);
        }

        onChange([...new Set(processed)]);
    };

    return (
        <>
            <Autocomplete
                multiple={multiple}
                freeSolo={freeSolo}
                options={options}
                value={value}
                inputValue={inputValue}

                onChange={handleChange}
                onInputChange={(e, val) => setInputValue(val)}

                onBlur={(e) => {
                    if (freeSolo && e.target.value.trim()) {
                        handleAddInput(e.target.value);
                    }
                }}

                onKeyDown={(e) => {
                    if (!allowBackspace && e.key === "Backspace" && !inputValue) {
                        e.defaultMuiPrevented = true;
                    }

                    if (!allowEnter && e.key === "Enter" && inputValue.trim().length === 0) {
                        e.defaultMuiPrevented = true;
                    }
                }}

                getOptionLabel={getOptionLabel}
                isOptionEqualToValue={isOptionEqualToValue}

                // 🔹 Chips control
                renderTags={
                    showChips
                        ? (tagValue, getTagProps) =>
                            tagValue.map((option, index) => (
                                <Chip
                                    label={getOptionLabel(option)}
                                    {...getTagProps({ index })}
                                />
                            ))
                        : () => null
                }

                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={label}
                        placeholder={placeholder}
                        {...textFieldProps}
                        onKeyDown={(e) => {
                            if (allowEnter && e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                // ✅ pass actual DOM value (fixes paste issue)
                                handleAddInput(e.target.value);
                                return;
                            }

                            if (allowComma && e.key === ",") {
                                e.preventDefault();

                                handleAddInput(e.target.value);
                                return;
                            }

                            if (!allowBackspace && e.key === "Backspace" && !inputValue) {
                                e.defaultPrevented = true;
                            }

                            textFieldProps?.onKeyDown?.(e);
                        }}
                        onPaste={(e) => {
                            if (!splitOnConfirmOnly && splitOnPaste) {

                                const pasted = e.clipboardData.getData("text");
                                if (pasted.includes(",") || pasted.includes(" ")) {
                                    e.preventDefault();
                                    const values = normalizeValues([
                                        ...value,
                                        pasted,
                                    ]);
                                    onChange(values);
                                }

                                textFieldProps?.onPaste?.(e);
                            }
                        }}
                    />
                )}

                {...autocompleteProps}
            />

            {error && (
                <Typography sx={{ fontSize: 12, color: "#FF3D57", mt: 1 }}>
                    {error}
                </Typography>
            )}
        </>
    );
};

export default SmartAutocomplete;