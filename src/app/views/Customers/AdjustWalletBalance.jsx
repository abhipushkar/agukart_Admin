import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import ConfirmModal from "app/components/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

const AdjustWalletBalance = ({ userdata,getUserById }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

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

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    setAmount("");
    setError("");
  };

  const handleAddBalance = async () => {
    if (!amount) {
      return setError("Please enter amount");
    }
    try {
      setLoading(true);
      const payload = {
        user_id: userdata?._id,
        amount: amount
      };
      const res = await ApiService.post(apiEndpoints.adjustCustomerWalletBalance, payload, auth_key);
      if (res?.status === 200) {
        handleOpen("success", res?.data);
        getUserById();
        handleModalClose();
      }
    } catch (error) {
      setLoading(false);
      handleOpen("error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box mt={5} p={1} backgroundColor={"#faf4f4"} borderRadius={"8px"}>
        <Box backgroundColor={"#fff"} boxShadow={"0 0 3px #d7d7d7"} borderRadius={"8px"} p={2}>
          <Typography
            component="div"
            sx={{
              display: "flex",
              gap: "12px",
              flexDirection: { lg: "row", md: "row", sm: "row", xs: "column" },
              justifyContent: "space-between",
              alignItems: { lg: "center", md: "center", sm: "center", xs: "start" }
            }}
          >
            <Typography component="div" fontWeight={"600"} fontSize={16}>
              Gift Card Balance
            </Typography>
            <Typography component="div">
              <Button variant="contained" startIcon={<EditIcon />} onClick={handleModalOpen}>
                Adjust Balance
              </Button>
            </Typography>
          </Typography>
          <Typography component="div" mt={2} fontSize={25} fontWeight={500}>
            $ {userdata?.wallet_balance}{" "}
            <Typography component="span" fontSize={20} color={"gray"}>
              USD
            </Typography>
          </Typography>
        </Box>

        {/* Modal for Adjust Balance */}
        <Dialog
          open={modalOpen}
          onClose={handleModalClose}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              width: "400px",
              height: "300px",
              position: "relative",
              borderRadius: "12px"
            }
          }}
        >
          <DialogTitle>
            Adjust Gift Card Balance
            <IconButton
              aria-label="close"
              onClick={handleModalClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500]
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <TextField
              sx={{ mt: 2 }}
              error={!!error}
              helperText={error}
              label="Amount"
              fullWidth
              variant="outlined"
              value={amount}
              onFocus={() => {
                if (!amount) {
                  setError("Please enter amount");
                } else {
                  setError("");
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                  setAmount(val);
                  setError("");
                }
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleModalClose}>Cancel</Button>
            <Button   
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
                variant="contained" 
                onClick={handleAddBalance}
            >
            Add Balance
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default AdjustWalletBalance;
