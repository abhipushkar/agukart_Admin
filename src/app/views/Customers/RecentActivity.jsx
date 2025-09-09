import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from "@mui/material";
import { Link } from "react-router-dom";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ApiService } from "app/services/ApiService";

dayjs.extend(relativeTime);

const LIMIT = 5;

const RecentActivity = ({ userdata }) => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userImageBaseUrl, setUserImageBaseUrl] = useState("");
  const [productBaseUrl, setProductBaseUrl] = useState("");
  const [shopBaseUrl, setShopBaseUrl] = useState("");
  console.log({ productBaseUrl, shopBaseUrl });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const getRecentActivity = async (currentPage = 1, reset = false) => {
    try {
      setLoading(true);
      const res = await ApiService.get(
        `${apiEndpoints.getRecentActivityData}?limit=${LIMIT}&page=${currentPage}&user_id=${userdata?._id}`,
        auth_key
      );

      if (res?.data?.status) {
        const newData = res.data.data || [];

        if (reset) {
          setRecentActivity(newData);
        } else {
          setRecentActivity((prev) => [...prev, ...newData]);
        }

        setUserImageBaseUrl(res.data.userBaseUrl || "");
        setProductBaseUrl(res?.data?.productBaseUrl || "");
        setShopBaseUrl(res?.data?.shopBaseUrl || "");
        setHasMore(newData.length === LIMIT);
      } else {
        if (reset) setRecentActivity([]);
        setHasMore(false);
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userdata?._id) {
      setPage(1);
      getRecentActivity(1, true);
    }
  }, [userdata?._id]);

  const handleShowMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    getRecentActivity(nextPage);
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <List>
          {recentActivity.length > 0 ? (
            <>
              <List>
                {recentActivity.map((activity, index) => {
                  const imageUrl = activity?.product_id
                    ? `${productBaseUrl}${activity?.productdata?.image?.[0]}`
                    : activity?.vendor_id
                    ? `${shopBaseUrl}${activity?.vendordata?.shop_icon}`
                    : `${userImageBaseUrl}${activity?.userdata?.image}`;
                  const itemName = activity?.description
                    ?.replace(/<\/?[^>]+(>|$)/g, "")
                    ?.replace(/&nbsp;/g, " ");

                  const relativeTimeText = `${dayjs(activity.createdAt).fromNow()}`;
                  const shopName = `• ${
                    activity?.vendordata?.shop_name ||
                    activity?.productdata?.product_title
                      ?.replace(/<\/?[^>]+(>|$)/g, "")
                      ?.replace(/&nbsp;/g, " ")
                  }`
                  console.log({ imageUrl }, "frgbhfhfhfghfgh");
                  return (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start" sx={{ alignItems: "flex-start", gap: 2 }}>
                        <ListItemAvatar>
                          <Avatar
                            alt={activity?.userdata?.name}
                            src={imageUrl}
                            sx={{ width: 100, height: 100, borderRadius: 2 }}
                            variant="square"
                          />
                        </ListItemAvatar>

                        <ListItemText
                          sx={{ mt: 0.5 }}
                          primary={
                            <Typography component="div" variant="body1">
                              <Typography component="span" fontWeight="bold" display="inline">
                                {activity?.userdata?.name}
                                {activity?.userdata?.id_number &&
                                  ` (${activity?.userdata?.id_number})`}
                              </Typography>{" "}
                              {activity.action}{" "}
                              <Link to="#" underline="hover" color="primary">
                                {itemName}
                              </Link>
                            </Typography>
                          }
                          secondary={
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              {relativeTimeText}{(activity?.product_id || activity?.vendor_id) && shopName}
                            </Typography>
                          }
                        />
                      </ListItem>

                      {index !== recentActivity.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </React.Fragment>
                  );
                })}
              </List>
              {recentActivity?.length > 0 && hasMore && (
                <Box textAlign="center" mt={2}>
                  <Button
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                    variant="outlined"
                    onClick={handleShowMore}
                  >
                    Show More
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body1">No recent activity found</Typography>
          )}
        </List>
      </Box>
    </>
  );
};

export default RecentActivity;
