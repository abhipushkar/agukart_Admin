import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { ApiService } from "app/services/ApiService";
import React, { useState, useEffect } from "react";
import OrderItem from "./OrderItem";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";

const SalesDetails = ({ userdata }) => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [salesDetails, setSalesDetail] = useState([]);
  const [baseUrl,setBaseUrl] = useState('');
  const [loading,setLoading] = useState(false);
  console.log({ salesDetails });

  const getSalesDetails = async () => {
    try {
      const payload = {
        user_id: userdata?._id
      };
      setLoading(true);
      const res = await ApiService.post(apiEndpoints.getUserOrderHistory, payload, auth_key);
      if (res.status === 200) {
        setLoading(false);
        setSalesDetail(res?.data?.data || []);
        setBaseUrl(res?.data?.base_url || "");
      }
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    getSalesDetails();
  }, []);

  return (
    <Grid lg={12} md={12} xs={12}>
      <h2 className="text-xl font-bold mb-4">Sales Details</h2>
      {
        loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" my={3}>
            <CircularProgress />
          </Box>
        ) :(
          <>
            {
              salesDetails.length > 0 ? (
                salesDetails.map((items, i) => (
                  <OrderItem key={i} items={items} getOrderList={getSalesDetails} baseUrl={baseUrl}/>
                ))
              ) : (
                <Typography variant="h6" textAlign="center" my="3">
                  No orders
                </Typography>
              )
            }
          </>
        )
      }
    </Grid>
  );
};

export default SalesDetails;
