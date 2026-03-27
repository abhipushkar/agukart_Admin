import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";

const OrderSlip = () => {
  const contentRef = useRef();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [query] = useSearchParams();
  const sales_id = query.get("sales_id");
  const sub_order_id = query.get("sub_order_id");
  console.log({ sales_id, sub_order_id }, "Order slip IDs");
  const [invoice, setInvoice] = useState([]);
  const [baseUrl, setBaseUrl] = useState("");
  console.log({ invoice });
  console.log({ baseUrl });

  useEffect(() => {
    const toolbarElement = document.querySelector(".css-1ppcp2l-MuiToolbar-root");
    const secondElement = document.querySelector(".css-149h5x2");

    if (toolbarElement) {
      toolbarElement.style.display = "none";
    }

    if (secondElement) {
      secondElement.style.display = "none";
    }

    return () => {
      if (toolbarElement) {
        toolbarElement.style.display = "";
      }

      if (secondElement) {
        secondElement.style.display = "";
      }
    };
  }, []);

  function formatDate(dateStr) {
    const date = new Date(dateStr);

    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        reactToPrintFn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reactToPrintFn]);

  const getOrderDetailForSlip = useCallback(async () => {
    try {
      const payload = {
        sales_id: sales_id,
        sub_order_id: sub_order_id
      };

      if (!sales_id && !sub_order_id) {
        console.error("No order IDs provided for order slip");
        return;
      }

      const res = await ApiService.post(apiEndpoints.getOrderInvoice, payload, auth_key);
      if (res?.status === 200) {
        console.log(res);
        setInvoice(res?.data?.data || []);
        setBaseUrl(res?.data?.base_url || "");
      }
    } catch (error) {
      console.log("error", error);
    }
  }, [auth_key, sales_id, sub_order_id])

  useEffect(() => {
    if (sales_id || sub_order_id) {
      getOrderDetailForSlip();
    }
  }, [getOrderDetailForSlip, sales_id, sub_order_id])

  const getVendorItems = (items) => {
    if (!items?.saleDetails) return [];

    if (sub_order_id) {
      return items.saleDetails.filter(item =>
        item.sub_order_id === sub_order_id ||
        item.saleDetailData?._id === sub_order_id ||
        item.saleDetailData?.[0]?._id === sub_order_id
      );
    }

    return items.saleDetails;
  };

  const getVendorData = (items) => {
    if (!items?.saleDetails?.length) return {};
    console.log(items)
    if (sub_order_id) {
      const vendorItem = items.saleDetails.find(item =>
        item.sub_order_id === sub_order_id ||
        item.saleDetailData?._id === sub_order_id ||
        item.saleDetailData?.[0]?._id === sub_order_id
      );

      return vendorItem?.saleDetailData?.vendorData ||
        vendorItem?.vendorData ||
        items?.vendorData ||
        {};
    }

    return items.saleDetails[0]?.saleDetailData?.vendorData ||
      items.saleDetails[0]?.vendorData ||
      items?.vendorData ||
      {};
  };

  const calculateVendorTotals = (items) => {
    const vendorItems = getVendorItems(items);

    const subtotal = vendorItems.reduce((sum, item) => sum + (item?.sub_total || 0), 0);
    const shippingTotal = vendorItems.reduce((sum, item) => sum + (item?.shippingAmount || 0), 0);
    const itemTotal = vendorItems.reduce((sum, item) => sum + (item?.amount || 0), 0);

    return {
      subtotal,
      shippingTotal,
      itemTotal
    };
  };

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              margin: 0.5cm;
              size: auto;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .print-container {
              margin: 0 auto;
              padding: 0 2px;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
      <Box
        ref={contentRef}
        className="print-container"
        sx={{
          width: '100%',
          '@media print': {
            maxWidth: '100%',
            margin: '0 auto',
            padding: '0 5px',
          }
        }}
      >
        {invoice?.map((items, index) => {
          const vendorData = getVendorData(items);
          const vendorItems = getVendorItems(items);
          const vendorTotals = calculateVendorTotals(items);

          return (
            <Box
              key={index}
              sx={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                mb: 3,
                pageBreakAfter: "always",
                '@media print': {
                  pageBreakAfter: 'always',
                  margin: '0 auto',
                  width: '100%',
                }
              }}
            >
              <Box sx={{ borderBottom: "2px dashed #000", padding: "8px 0" }}>
                <Typography component="h6" sx={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>
                  {items?.name}
                </Typography>
                <Typography component="h6" sx={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>
                  {items?.address_line1}
                </Typography>
                <Typography component="h6" sx={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>
                  {`${items?.address_line2 ? items?.address_line2 + "," : ""}`} {items?.city}, {items?.state}, {items?.pincode}
                </Typography>
                <Typography component="h6" sx={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>
                  {items?.country}
                </Typography>
                <Typography component="h6" sx={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>
                  Phone number{" "}
                  <span>
                    {items?.phone_code} {items?.mobile}
                  </span>
                </Typography>
              </Box>

              <Box sx={{ mt: 3, py: 1, px: 2, border: "1px solid grey" }}>
                <Grid container sx={{ flexWrap: 'nowrap' }}>
                  <Grid item xs={12} md={6}>
                    <Typography component="h6" sx={{ fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>
                      Shipping Address
                    </Typography>
                    <Typography component="h6" sx={{ fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>
                      {items?.name}
                    </Typography>
                    <Typography component="h6" sx={{ fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>
                      {items?.address_line1}
                    </Typography>
                    <Typography component="h6" sx={{ fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>
                      {`${items?.address_line2 ? items?.address_line2 + "," : ""}`} {items?.city}, {items?.state}, {items?.pincode}
                    </Typography>
                    <Typography component="h6" sx={{ fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>
                      {items?.country}
                    </Typography>
                    <Typography component="h6" sx={{ fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>
                      Phone number{" "}
                      <span>
                        {items?.phone_code} {items?.mobile}
                      </span>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography component="h5" sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                      {sub_order_id && (
                        <span style={{ fontSize: "16px", color: "#666" }}>
                          Reciept Id: #{sub_order_id || "N/A"}
                        </span>
                      )}
                    </Typography>
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '200px' }}>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '40%', whiteSpace: 'nowrap', fontSize: "12px" }}>
                              Order Date :
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', fontSize: "12px" }}>
                              {formatDate(items?.createdAt)}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '40%', whiteSpace: 'nowrap', fontSize: "12px" }}>
                              Shipping Service :
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', fontSize: "12px" }}>
                              {items.saleDetails?.[0]?.shippingName?.charAt(0).toUpperCase() + items.saleDetails?.[0]?.shippingName?.slice(1) || ""}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '40%', whiteSpace: 'nowrap', fontSize: "12px" }}>
                              Buyer Name :
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', fontSize: "12px" }}>{items?.name}</TableCell>
                          </TableRow>
                          {sub_order_id && (
                            <TableRow>
                              <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '40%', whiteSpace: 'nowrap', fontSize: "12px" }}>Store :</TableCell>
                              <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', fontSize: "12px" }}>{vendorData?.shop_name || vendorData?.name || "N/A"}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Typography component="h6" sx={{ fontSize: '1rem', fontWeight: 500, my: 2 }}>
                Thank you for buying from{" "}
                <span style={{ color: "#d32f2f" }}>{vendorData?.name || "N/A"}</span> on{" "}
                <span style={{ color: "#d32f2f" }}>Agukart</span> Marketplace
              </Typography>

              <Box>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '5%', fontSize: "12px" }}>Qty</TableCell>
                        <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '10%', fontSize: "12px" }}>Image</TableCell>
                        <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '50%', fontSize: "12px" }}>Product Details</TableCell>
                        <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '10%', fontSize: "12px" }}>Unit Price</TableCell>
                        <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', width: '25%', fontSize: "12px" }}>Order Totals</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vendorItems.length > 0 ? (
                        vendorItems.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', fontSize: "12px" }}>{item?.qty}</TableCell>
                            <TableCell sx={{
                              textAlign: "center",
                              border: '1px solid #dee2e6',
                              padding: '4px',
                              width: '10%'
                            }}>
                              <img
                                src={`${baseUrl}/${item?.productData?.image?.[0]}`}
                                alt=""
                                style={{
                                  width: '100%',
                                  maxWidth: '100px',
                                  height: 'auto',
                                  objectFit: 'contain'
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<span>No image</span>';
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px' }}>
                              <Typography sx={{ fontWeight: "bold", marginBottom: "5px" }}>
                                {(() => {
                                  const text = item?.productData?.product_title?.replace(/<\/?[^>]+(>|$)/g, "");
                                  if (!text) return "";

                                  const maxLength = 80;
                                  if (text.length <= maxLength) return text;

                                  // Find the last space within the maxLength
                                  let cutIndex = text.lastIndexOf(' ', maxLength);

                                  // If no space found, cut at maxLength
                                  if (cutIndex === -1) cutIndex = maxLength;

                                  return text.substring(0, cutIndex) + "...";
                                })()}
                              </Typography>
                              <Box>
                                <Table sx={{ width: '100%' }}>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell sx={{ width: "30%", padding: "2px 0", border: 'none', fontSize: "12px" }}>Order Item ID :</TableCell>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>{item?._id?.slice(-8) || "N/A"}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>SKU :</TableCell>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>{item?.productData?.sku_code || "N/A"}</TableCell>
                                    </TableRow>
                                    {item?.isCombination === true &&
                                      item?.variantData?.map((variantItem, variantIndex) => (
                                        <TableRow key={`variant-${variantIndex}`}>
                                          <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>{variantItem?.variant_name} :</TableCell>
                                          <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>
                                            {item?.variantAttributeData?.[variantIndex]?.attribute_value}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    {item?.variants && item.variants.length > 0 && (
                                      <>
                                        {item.variants.map((variant, variantIndex) => (
                                          <TableRow key={`internal-variant-${variantIndex}`}>
                                            <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>{variant?.variantName || "Variant"} :</TableCell>
                                            <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>{variant?.attributeName || "N/A"}</TableCell>
                                          </TableRow>
                                        ))}
                                      </>
                                    )}
                                    {/* {item?.variant_id && item.variant_id.length > 0 &&
                                      !item?.variantData?.length &&
                                      !item?.variants?.length && (
                                        <TableRow>
                                          <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>Variant IDs :</TableCell>
                                          <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>
                                            {item.variant_id.join(", ")}
                                          </TableCell>
                                        </TableRow>
                                      )} */}
                                    {item?.customize === "Yes" && (
                                      <TableRow>
                                        <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>Customization :</TableCell>
                                        <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "12px" }}>Yes</TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px', fontSize: "12px" }}>
                              $ {item?.productData?.sale_price?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell sx={{ border: '1px solid #dee2e6', padding: '4px' }}>
                              <Box>
                                <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "left" }}>Item Subtotal</TableCell>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "right" }}>$ {item?.amount?.toFixed(2) || "0.00"}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "left" }}>Shipping total</TableCell>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "right" }}>$ {(item?.shippingAmount || 0).toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "left" }}>Tax</TableCell>
                                      <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "right" }}>$ 0.00</TableCell>
                                    </TableRow>
                                    {item?.promotional_discount > 0 && (
                                      <TableRow>
                                        <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "left" }}>Promotion :</TableCell>
                                        <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "right" }}>-US$ {(item?.promotional_discount || 0).toFixed(2)}</TableCell>
                                      </TableRow>
                                    )}
                                    {item?.couponDiscountAmount > 0 && (
                                      <TableRow>
                                        <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "left" }}>Coupon :</TableCell>
                                        <TableCell sx={{ padding: "2px 0", border: 'none', fontSize: "11px", textAlign: "right" }}>-US$ {(item?.couponDiscountAmount || 0).toFixed(2)}</TableCell>
                                      </TableRow>
                                    )}
                                    <TableRow>
                                      <TableCell sx={{ padding: "2px 0", fontWeight: "bold", fontSize: "11px", textAlign: "left", borderBottom: "none" }}>Item total</TableCell>
                                      <TableCell sx={{ padding: "2px 0", fontWeight: "bold", fontSize: "11px", textAlign: "right", borderBottom: "none" }}>$ {((item?.amount || 0) + (item?.shippingAmount || 0) - (item?.couponDiscountAmount || 0)).toFixed(2)}</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} sx={{ textAlign: "center", border: '1px solid #dee2e6', padding: '8px' }}>
                            No items found for this order
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box component="table" sx={{ borderCollapse: 'collapse', minWidth: "25%" }}>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ padding: "4px 8px" }}>Subtotal :</TableCell>
                      <TableCell sx={{ padding: "4px 8px", textAlign: "right" }}>$ {vendorTotals.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ padding: "4px 8px" }}>Shipping Total :</TableCell>
                      <TableCell sx={{ padding: "4px 8px", textAlign: "right" }}>$ {vendorTotals.shippingTotal.toFixed(2)}</TableCell>
                    </TableRow>
                    {items?.voucher_dicount > 0 && (
                      <TableRow>
                        <TableCell sx={{ padding: "4px 8px" }}>Voucher Discount :</TableCell>
                        <TableCell sx={{ padding: "4px 8px", textAlign: "right" }}>-US$ {(items?.voucher_dicount || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ padding: "4px 8px" }}>Tax :</TableCell>
                      <TableCell sx={{ padding: "4px 8px", textAlign: "right" }}>$ 0.00</TableCell>
                    </TableRow>
                    <TableRow sx={{ borderTop: "2px solid #000" }}>
                      <TableCell sx={{ padding: "8px", fontWeight: "bold" }}>Grand total :</TableCell>
                      <TableCell sx={{ padding: "8px", fontWeight: "bold", textAlign: "right" }}>$ {(vendorTotals.subtotal - (items?.voucher_dicount || 0)).toFixed(2)}</TableCell>
                    </TableRow>
                    {items?.wallet_used > 0 && (
                      <TableRow>
                        <TableCell sx={{ padding: "4px 8px" }}>Used Gift Card :</TableCell>
                        <TableCell sx={{ padding: "4px 8px", textAlign: "right" }}>-US$ {(items?.wallet_used || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    )}
                    {items?.wallet_used > 0 && (
                      <TableRow>
                        <TableCell sx={{ padding: "4px 8px" }}>Pay By PayPal :</TableCell>
                        <TableCell sx={{ padding: "4px 8px", textAlign: "right" }}>$ {(vendorTotals.subtotal - (items?.voucher_dicount || 0) - (items?.wallet_used || 0)).toFixed(2)}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
};

export default OrderSlip;