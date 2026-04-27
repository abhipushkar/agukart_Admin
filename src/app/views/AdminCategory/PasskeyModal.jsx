// PasskeyModal.jsx
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress,
    IconButton,
    InputAdornment
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const PasskeyModal = ({ open, onClose, onConfirm, loading = false }) => {
    const [passkey, setPasskey] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!open) {
            setPasskey("");
            setShowPassword(false);
        }
    }, [open]);

    const handleConfirm = () => {
        if (passkey.trim()) {
            onConfirm(passkey);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && passkey.trim() && !loading) {
            onConfirm(passkey);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                Create Parent Admin Category
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        To create a parent admin category, please enter the passkey.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Passkey"
                        type={showPassword ? "text" : "password"}
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter passkey"
                        disabled={loading}
                        autoFocus
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                        disabled={loading}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{
                            "& .MuiInputBase-root": {
                                height: "40px"
                            }
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    color="primary"
                    variant="contained"
                    disabled={!passkey.trim() || loading}
                >
                    {loading ? <CircularProgress size={20} /> : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PasskeyModal;