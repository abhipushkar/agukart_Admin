import React, { useState, useRef } from 'react';
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
    Alert
} from '@mui/material';
import { ApiService } from 'app/services/ApiService';
import { apiEndpoints } from 'app/constant/apiEndpoints';
import { localStorageKey } from 'app/constant/localStorageKey';
import { getDashboardRoute } from 'app/constant/routeHelper';

const OtpModal = ({ open, onClose, email, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRefs = useRef([]);
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            // If current box is empty, move to previous
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (index, e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!pasted) return;

        const newOtp = otp.padEnd(6, "").split("");
        pasted.slice(0, 6 - index).split("")
            .forEach((char, i) => {
                newOtp[index + i] = char;
            });

        setOtp(newOtp.join("").trimEnd());
        const focusIndex = Math.min(index + pasted.length - 1, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleOtpChange = (index, value) => {
        value = value.replace(/\D/g, '');

        if (value.length > 1) return;

        const newOtp = otp.split('');
        newOtp[index] = value;

        setOtp(newOtp.join(''));
        setError('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                email: email,
                otp: otp
            };

            const response = await ApiService.login(apiEndpoints.verifyOtp, payload);

            if (response.status === 200 && response.data.status) {
                // Store any additional data if needed
                if (response.data.token) {
                    localStorage.setItem(localStorageKey.auth_key, response.data.token);
                }
                if (response.data.user?.designation_id) {
                    localStorage.setItem(localStorageKey.designation_id, response.data.user.designation_id);
                }
                if (response.data.user?.designation_id === 3) {
                    localStorage.setItem(localStorageKey.vendorId, response.data.user._id);
                }

                onSuccess?.();
                window.location.replace(getDashboardRoute());
            } else {
                setError(response.data.message || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError(error?.response?.data?.message || 'Failed to verify OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');

        try {
            const payload = {
                email: email
            };

            const response = await ApiService.post(apiEndpoints.resendOtp, payload);

            if (response.status === 200 && response.data.success) {
                // Show success message or toast
                setError('');
                // You can add a toast notification here
            } else {
                setError(response.data.message || 'Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setError(error?.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setOtp('');
            setError('');
            onClose?.();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2
                }
            }}
        >
            <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
                <Typography variant="h5" component="h2">
                    Verify OTP
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    We've sent a 6-digit OTP to your email.
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 1 }}>
                            {error}
                        </Alert>
                    )}

                    <Box display="flex" gap={1} justifyContent={'center'}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <TextField
                                key={index}
                                inputRef={(el) => (inputRefs.current[index] = el)}
                                value={otp[index] || ""}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={(e) => handlePaste(index, e)}
                                inputProps={{
                                    maxLength: 1,
                                    style: {
                                        textAlign: "center",
                                        fontSize: 24,
                                    },
                                }}
                                sx={{ width: 56 }}
                            />
                        ))}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mt: 1 }}>

                        <Typography variant="caption" >
                            {otp.length}/6 digits
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    disabled={loading}
                    variant='outlined'
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleVerifyOtp}
                    variant="contained"
                    disabled={loading || otp.length !== 6}
                    sx={{
                        minWidth: 100,
                        backgroundColor: loading ? 'rgba(255,255,255,0.1)' : 'primary.main',
                    }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OtpModal;