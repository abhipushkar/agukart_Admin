import React, { useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Typography, CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ConfirmModal from "app/components/ConfirmModal";
import { localStorageKey } from "app/constant/localStorageKey";

const ResetPasswordModal = ({ userdata }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState(null);
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const handleReset = async () => {
    try {
      setLoading(true);
      const res = await ApiService.post(apiEndpoints.resetCustomerPassword, { user_id: userdata?._id,email:userdata?.email }, auth_key);
      if (res?.status === 200) {
        setType("success");
        setMsg(res?.data?.message);
        setConfirmOpen(true);
        setOpen(false);
      }
    } catch (err) {
      setType("error");
      setMsg(err?.message || err?.response?.data?.message || "Something went wrong");
      setConfirmOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="text" sx={{ color: '#000' }} onClick={() => setOpen(true)}><LockOpenIcon sx={{ fontSize: '18px' }} /> Reset & Send Password</Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>
          Reset & Send Password
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to reset this user's password?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReset}
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmModal open={confirmOpen} handleClose={() => setConfirmOpen(false)} type={type} msg={msg} />
    </>
  );
};

export default ResetPasswordModal;
