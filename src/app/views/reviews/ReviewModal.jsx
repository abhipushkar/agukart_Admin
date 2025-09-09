import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { TextField } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4
};

// Define the ReviewModal component correctly
const ReviewModal = ({ open1, handleClose1, rejectRemark, setRejectRemark, type1, addCmnt, changeReviewStatus, affiliateCommision, setAffiliateCommision }) => {
  return (
    <div>
      <Modal
        open={open1}
        onClose={handleClose1}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Confirmation
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {addCmnt}
          </Typography>
          {type1 === "approved" && <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              size="large"
              label="Enter Affiliate Commission(In Percentage)"
              type="text"
              InputLabelProps={{ shrink: true }}
              value={affiliateCommision}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setAffiliateCommision(value);
                }
              }}
            />
          </Typography>}
          {type1 === "rejected" && <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              size="large"
              label="Enter your reason here"
              type="text"
              InputLabelProps={{ shrink: true }}
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
            />
          </Typography>}
          <Box display={"flex"} justifyContent={"end"} alignItems={'center'} mt={2}>
            <Button variant="contained" sx={{ marginRight: "5px" }} color="success" onClick={changeReviewStatus}>Yes</Button>
            <Button variant="contained" color="error" onClick={handleClose1}>No</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default ReviewModal;
