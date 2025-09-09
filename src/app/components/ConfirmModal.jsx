import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { lg: "500px", md: "500px", xs: "100%" },
  bgcolor: "background.paper",
  borderTop: "6px solid #23486d",
  boxShadow: "0px 11px 15px - 7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)",
  borderRadius: "8px",
}

export default function ConfirmModal({
  open,
  handleClose,
  handleReset,
  type,
  msg,
  handleRemoveFields,
  handleStatusChange,
  handlePopularGiftStatusChange,
  handleFeaturedStatusChange,
  handleDelete,
  handleSpecialCatStatusChange,
  handleFour
}) {

  const handleConfirm = () => {
    if (type === "remove") {
      handleRemoveFields();
    } else if (type === "reset") {
      handleReset();
    } else if (type === "blogStatus" || type === "brandStatus" || type === "adminCatStatus" || type === "catStatus" || type === "vendorStatus" || type === "sliderStatus" || type === "couponStatus" || type=="promotionalOfferStatus" || type==="giftCardCategoryStatus" || type==="giftCardStatus" || type === "bannerStatus" || type === "bestSellingStatus" || type === "policyStatus" || type === "storeStatus" || type === "customerStatus" || type === "voucherStatus") {
      handleStatusChange();
    } else if (type === "popularGiftStatus") {
      handlePopularGiftStatusChange()
    }else if (type === "blogFeaturedStatus" || type === "brandFeaturedStatus" || type === "adminCatPopularStatus" || type === "catTopRatedStatus") {
      handleFeaturedStatusChange()
    } else if (type === "blogDelete" || type === "sliderDelete" || type === "deleteMember" || type === "deleteShopPhoto" || type === "variantDelete" || type === "couponDelete" || type==="promotionalOfferDelete" || type==="giftCardCategoryDelete" || type==="giftCardDelete" || type === "bannerDelete" || type === "policyDelete" || type === "storeDelete" || type === "voucherDelete") {
      handleDelete()
    } else if (type === "adminSpecialCatStatus") {
      handleSpecialCatStatusChange()
    } else if (type === "adminMenuItemStatus") {
      handleFour()
    }
    handleClose();
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography component="div" sx={{ padding: "18px", display: "flex", alignItems: "center" }}>
            <Typography component="div" pr={2}>

              {/* error icon */}
              {type === "error" && <svg stroke="#e33131" fill="#e33131" stroke-width="0" viewBox="0 0 16 16" height="60px" width="60px" xmlns="http://www.w3.org/2000/svg"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"></path></svg>}
              {/* check icon */}
              {type === "success" && <svg stroke="green" fill="green" stroke-width="0" viewBox="0 0 16 16" height="60px" width="60px" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"></path><path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"></path></svg>}

              {/* notIcon */}
              {(type !== "error" && type !== "success") && <svg stroke="#d89d25" fill="#d89d25" stroke-width="0" viewBox="0 0 16 16" height="60px" width="60px" xmlns="http://www.w3.org/2000/svg"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"></path><path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"></path></svg>}
            </Typography>
            <Typography component="div">
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {type=="success"?"Confirmation":type=="error"?"Failed":"Warning"}
              </Typography>
              <Typography id="modal-modal-description">
                {type === "remove" && "Are you sure you want to remove variant attribute?"}
                {type === "reset" && "Are you sure you want to reset variant attribute?"}
                {type === "blogStatus" && "Are you sure you want to change blog status?"}
                {type === "blogFeaturedStatus" && "Are you sure you want to change blog featured?"}
                {type === "blogDelete" && "Are you sure you want to delete blog?"}
                {type === "brandStatus" && "Are you sure you want to change brand status?"}
                {type === "brandFeaturedStatus" && "Are you sure you want to change brand featured?"}
                {type === "adminCatStatus" && "Are you sure you want to change admin category status?"}
                {type === "adminCatPopularStatus" && "Are you sure you want to change admin popular category?"}
                {type === "adminSpecialCatStatus" && "Are you sure you want to change admin special category?"}
                {type === "adminMenuItemStatus" && "Are you sure you want to change admin menu item?"}
                {type === "catTopRatedStatus" && "Are you sure you want to change top rated category?"}
                {type === "catStatus" && "Are you sure you want to change category status?"}
                {type === "vendorStatus" && "Are you sure you want to change vendor status?"}
                {type === "order" && "This is pending from client side"}
                {type === "sliderStatus" && "Are you sure you want to change slider status?"}
                {type === "sliderDelete" && "Are you sure you want to delete?"}
                {type === "variantDelete" && "Are you sure you want to delete?"}
                {type === "deleteMember" && "Are you sure you want to delete member?"}
                {type === "deleteShopPhoto" && "Are you sure you want to delete shop photo?"}
                {type === "couponDelete" && "Are you sure you want to delete?"}
                {type === "couponStatus" && "Are you sure you want to change coupon status?"}
                {type === "promotionalOfferStatus" && "Are you sure you want to change promotional offer status?"}
                {type === "promotionalOfferDelete" && "Are you sure you want to delete?"}
                {type === "giftCardCategoryStatus" && "Are you sure you want to change gift card category status?"}
                {type === "giftCardCategoryDelete" && "Are you sure you want to delete?"}
                {type === "giftCardStatus" && "Are you sure you want to change gift card status?"}
                {type === "giftCardDelete" && "Are you sure you want to delete?"}
                {type === "bannerStatus" && "Are you sure you want to change banner status?"}
                {type === "bannerDelete" && "Are you sure you want to delete?"}
                {type === "bestSellingStatus" && "Are you sure you want to change best selling status?"}
                {type === "popularGiftStatus" && "Are you sure you want to change popular gift status?"}
                {type === "policyStatus" && "Are you sure you want to change policy status?"}
                {type === "policyDelete" && "Are you sure you want to delete?"}
                {type === "storeStatus" && "Are you sure you want to change store status?"}
                {type === "storeDelete" && "Are you sure you want to delete?"}
                {type === "customerStatus" && "Are you sure you want to change customer account status?"}
                {type === "voucherStatus" && "Are you sure you want to change voucher status?"}
                {type === "voucherDelete" && "Are you sure you want to delete?"}
                {msg && msg} 
              </Typography>
            </Typography>
          </Typography>
          {/* Button container */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", borderTop: "2px solid #cccccc", padding: "18px" }}>
            <Button onClick={handleClose} sx={{ mr: 2, border: '2px solid #23486d', color: '#23486d' }}>
              Close
            </Button>
            {(type !== "order" && type !== "success" && type !== "error") && <Button onClick={handleConfirm} variant="contained" sx={{ background: "#23486d" }}>
              Confirm
            </Button>}
          </Box>
        </Box>
      </Modal>
    </div>
  );
}