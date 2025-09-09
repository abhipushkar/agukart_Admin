import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Rating
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { REACT_APP_WEB_URL } from "config";

const CustomerDataModal = ({ type, userdata }) => {
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [shopIconBaseUrl, setShopIconBaseUrl] = useState("");
  console.log({ modalData });
  const auth_key = localStorage.getItem(localStorageKey.auth_key);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const getModalData = async () => {
    try {
      setLoading(true);
      setModalData([]);
      const res = await ApiService.get(
        `${apiEndpoints.getCustomerModalData}?user_id=${userdata?._id}&type=${type}`,
        auth_key
      );
      if (res?.data?.success) {
        setModalData(res?.data?.data);
        setImageBaseUrl(res?.data?.productBaseUrl);
        setShopIconBaseUrl(res?.data?.shopiconBaseUrl);
      } else {
        setModalData([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type && openModal) {
      getModalData();
    }
  }, [type, openModal]);

  function formatDateTimeToDDMMYYYY(dateInput) {
    const date = new Date(dateInput);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  }

  return (
    <>
      <Grid item lg={6} md={6} sm={6} xs={12}>
        <Button
          onClick={handleOpen}
          sx={{
            background: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minWidth: "auto",
            height: "40px",
            width: "40px"
          }}
        >
          <VisibilityIcon />
        </Button>
      </Grid>

      {/* Modal for Abandoned Basket Items */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {type == "cart"
            ? "Abandoned Basket Items"
            : type == "review"
            ? "Reviews"
            : type == "shop"
            ? "Shop Follows"
            : "Favourites Items"}
          <IconButton onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {modalData?.length > 0 ? (
            <List>
              {modalData?.map((item, index) => (
                <ListItem key={index} divider>
                  {type == "shop" ? (
                    <>
                      <ListItemAvatar>
                        <Avatar
                          variant="square"
                          src={
                            item?.vendor_data?.shop_icon
                              ? `${shopIconBaseUrl}${item?.vendor_data?.shop_icon}`
                              : ""
                          }
                          alt="image"
                          sx={{ width: 100, height: 100, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              window.open(
                                `${REACT_APP_WEB_URL}/store/${item?.vendor_data?.slug}`,
                                "_blank"
                              );
                            }}
                          >
                            {item?.vendor_data?.shop_name}
                          </span>
                        }
                         secondary={
                          <>
                            {item?.createdAt && (
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                Created At: {formatDateTimeToDDMMYYYY(item?.createdAt || "")}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </>
                  ) : (
                    <>
                      <ListItemAvatar>
                        <Avatar
                          variant="square"
                          src={
                            item?.product_id?.image?.[0]
                              ? `${imageBaseUrl}${item?.product_id?.image?.[0]}`
                              : ""
                          }
                          alt={item?.product_id?.product_title || "Product"}
                          sx={{ width: 100, height: 100, mr: 2 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <span
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              window.open(
                                `${REACT_APP_WEB_URL}/products/?id=${item?.product_id?._id}`,
                                "_blank"
                              );
                            }}
                          >
                            {item?.product_id?.product_title.replace(/<\/?[^>]+(>|$)/g, "") ||
                              "Product"}
                          </span>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                              Qty: {item?.qty || 1} | Price: $
                              {item?.price || item?.product_id?.sale_price || 0}
                            </Typography>
                            {item?.vendor_data?.shop_name && (
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                Shop: {item?.vendor_data?.shop_name}
                              </Typography>
                            )}
                            {item?.createdAt && (
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                Created At: {formatDateTimeToDDMMYYYY(item?.createdAt || "")}
                              </Typography>
                            )}
                            {type == "review" && (
                              <>
                                <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                                  <Rating value={item?.item_rating} precision={0.5} readOnly />
                                </Box>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                  sx={{ fontStyle: "italic" }}
                                >
                                  {item?.additional_comment}
                                </Typography>
                              </>
                            )}
                          </>
                        }
                      />
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>
              No{" "}
              {type == "cart"
                ? "Abandoned Basket Items"
                : type == "review"
                ? "Reviews"
                : type == "shop"
                ? "Shop Follows"
                : "Favourites Items"}{" "}
              found.
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomerDataModal;
