import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useCallback } from "react";

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
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href =
      "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css";
    bootstrapLink.integrity =
      "sha512-jnSuA4Ss2PkkikSOLtYs8BlYIeeIK1h99ty4YfvRPAlzr377vr3CXDb7sb7eEEBYjDtcYj+AjBH3FLv5uSJuXg==";
    bootstrapLink.crossOrigin = "anonymous";

    document.head.appendChild(bootstrapLink);

    const toolbarElement = document.querySelector(".css-1ppcp2l-MuiToolbar-root");
    const secondElement = document.querySelector(".css-149h5x2");

    if (toolbarElement) {
      toolbarElement.style.display = "none";
    }

    if (secondElement) {
      secondElement.style.display = "none";
    }

    return () => {
      document.head.removeChild(bootstrapLink);

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

      // Only send if we have at least one ID
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

  // Helper to get vendor-specific items
  const getVendorItems = (items) => {
    if (!items?.saleDetails) return [];

    // If we have a sub_order_id, filter items by vendor
    if (sub_order_id) {
      return items.saleDetails.filter(item =>
        item.sub_order_id === sub_order_id ||
        item.saleDetailData?._id === sub_order_id ||
        item.saleDetailData?.[0]?._id === sub_order_id
      );
    }

    return items.saleDetails;
  };

  // Helper to get vendor data
  const getVendorData = (items) => {
    if (!items?.saleDetails?.length) return {};

    // If we have a sub_order_id, find the specific vendor
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

    // For master view, use first vendor or main vendor data
    return items.saleDetails[0]?.saleDetailData?.vendorData ||
      items.saleDetails[0]?.vendorData ||
      items?.vendorData ||
      {};
  };

  // Calculate vendor-specific totals
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
      <div className="container-fluid" id="order-slip" ref={contentRef}>
        {invoice?.map((items, index) => {
          const vendorData = getVendorData(items);
          const vendorItems = getVendorItems(items);
          const vendorTotals = calculateVendorTotals(items);

          return (
            <div className="container mb-3" key={index} style={{ pageBreakAfter: "always" }}>
              <div className="row" style={{ borderBottom: "2px dashed #000", padding: "8px 0" }}>
                <div className="col-12">
                  <h5>{items?.name}</h5>
                  <h5>{items?.address_line1}</h5>
                  <h5>
                    {items?.address_line2}, {items?.city}, {items?.state}, {items?.pincode}
                  </h5>
                  <h5>{items?.country}</h5>
                  <h5>
                    Phone number{" "}
                    <span>
                      {items?.phone_code} {items?.mobile}
                    </span>{" "}
                  </h5>
                </div>
              </div>
              <div className="row mt-3 p-3" style={{ border: "1px solid grey" }}>
                <div className="col-lg-6">
                  <h6>Shipping Address</h6>
                  <h6>{items?.name}</h6>
                  <h6>{items?.address_line1}</h6>
                  <h6>
                    {items?.address_line2}, {items?.city}, {items?.state}, {items?.pincode}
                  </h6>
                  <h6>{items?.country}</h6>
                  <h6>
                    Phone number{" "}
                    <span>
                      {items?.phone_code} {items?.mobile}
                    </span>{" "}
                  </h6>
                </div>
                <div className="col-lg-6 ">
                  <h5>
                    Order ID : <span>{items?.order_id}</span>
                    {sub_order_id && (
                      <span style={{ fontSize: "14px", marginLeft: "8px", color: "#666" }}>
                        (Transaction Id: #{sub_order_id?.slice(-8)})
                      </span>
                    )}
                  </h5>
                  <div className="table-responsive mt-4">
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <td>Order Date :</td>
                          <td>{formatDate(items?.createdAt)}</td>
                        </tr>
                        <tr>
                          <td>Shipping Service :</td>
                          <td>Standard</td>
                        </tr>
                        <tr>
                          <td>Buyer Name :</td>
                          <td>{items?.name}</td>
                        </tr>
                        <tr>
                          <td>Seller Name :</td>
                          <td>{vendorData?.name || "N/A"}</td>
                        </tr>
                        {sub_order_id && (
                          <tr>
                            <td>Vendor Shop :</td>
                            <td>{vendorData?.shop_name || vendorData?.name || "N/A"}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <h6 className="fs-5 my-4">
                Thank you for buying from{" "}
                <span className="text-danger">{vendorData?.name || "N/A"}</span> on{" "}
                <span className="text-danger">Website</span> Marketplace
              </h6>
              <div className="row">
                <div className="col-12">
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <td>Qty</td>
                          <td>Image</td>
                          <td>Product Details</td>
                          <td>Unit Price</td>
                          <td>Order Totals</td>
                        </tr>
                      </thead>
                      <tbody>
                        {vendorItems.length > 0 ? (
                          vendorItems.map((item, i) => (
                            <tr key={i}>
                              <td>{item?.qty}</td>
                              <td className="text-center">
                                <img
                                  src={`${baseUrl}/${item?.productData?.image?.[0]}`}
                                  alt=""
                                  className="img-fluid "
                                  style={{ width: 100, height: 100 }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<span>No image</span>';
                                  }}
                                />
                              </td>
                              <td>
                                <p style={{ fontWeight: "bold", marginBottom: "10px" }}>
                                  {item?.productData?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                                </p>
                                <div>
                                  <table className="w-100">
                                    <tbody>
                                      <tr>
                                        <td style={{ width: "40%", padding: "4px 0" }}>Order Item ID :</td>
                                        <td style={{ padding: "4px 0" }}>{item?._id?.slice(-8) || "N/A"}</td>
                                      </tr>
                                      <tr>
                                        <td style={{ padding: "4px 0" }}>SKU :</td>
                                        <td style={{ padding: "4px 0" }}>{item?.productData?.sku_code || "N/A"}</td>
                                      </tr>
                                      {/* Show variantData (Amazon-style variants) */}
                                      {item?.isCombination === true &&
                                        item?.variantData?.map((variantItem, variantIndex) => (
                                          <tr key={`variant-${variantIndex}`} style={{ padding: "4px 0" }}>
                                            <td style={{ padding: "4px 0" }}>{variantItem?.variant_name} :</td>
                                            <td style={{ padding: "4px 0" }}>
                                              {
                                                item?.variantAttributeData?.[variantIndex]
                                                  ?.attribute_value
                                              }
                                            </td>
                                          </tr>
                                        ))}
                                      {/* Show variants array (Etsy-style variants) */}
                                      {item?.variants && item.variants.length > 0 && (
                                        <>
                                          {item.variants.map((variant, variantIndex) => (
                                            <tr key={`internal-variant-${variantIndex}`} style={{ padding: "4px 0" }}>
                                              <td style={{ padding: "4px 0" }}>{variant?.variantName || "Variant"} :</td>
                                              <td style={{ padding: "4px 0" }}>{variant?.attributeName || "N/A"}</td>
                                            </tr>
                                          ))}
                                        </>
                                      )}
                                      {/* Show variant IDs if no variant data is available */}
                                      {item?.variant_id && item.variant_id.length > 0 &&
                                        !item?.variantData?.length &&
                                        !item?.variants?.length && (
                                          <tr style={{ padding: "4px 0" }}>
                                            <td style={{ padding: "4px 0" }}>Variant IDs :</td>
                                            <td style={{ padding: "4px 0" }}>
                                              {item.variant_id.join(", ")}
                                            </td>
                                          </tr>
                                        )}
                                      {item?.customize === "Yes" && (
                                        <tr style={{ padding: "4px 0" }}>
                                          <td style={{ padding: "4px 0" }}>Customization :</td>
                                          <td style={{ padding: "4px 0" }}>Yes</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                              <td>$ {item?.productData?.sale_price?.toFixed(2) || "0.00"} </td>
                              <td>
                                <div>
                                  <table className="w-100">
                                    <tbody>
                                      <tr>
                                        <td style={{ padding: "4px 0" }}>Item Subtotal </td>
                                        <td style={{ padding: "4px 0" }}>$ {item?.amount?.toFixed(2) || "0.00"}</td>
                                      </tr>
                                      <tr>
                                        <td style={{ padding: "4px 0" }}>Shipping total </td>
                                        <td style={{ padding: "4px 0" }}>$ {(item?.shippingAmount || 0).toFixed(2)}</td>
                                      </tr>
                                      <tr>
                                        <td style={{ padding: "4px 0" }}>Tax </td>
                                        <td style={{ padding: "4px 0" }}>$ 0.00</td>
                                      </tr>
                                      {item?.promotional_discount > 0 && (
                                        <tr>
                                          <td style={{ padding: "4px 0" }}>Promotion : </td>
                                          <td style={{ padding: "4px 0" }}>-US$ {(item?.promotional_discount || 0).toFixed(2)}</td>
                                        </tr>
                                      )}
                                      {item?.couponDiscountAmount > 0 && (
                                        <tr>
                                          <td style={{ padding: "4px 0" }}>Coupon : </td>
                                          <td style={{ padding: "4px 0" }}>-US$ {(item?.couponDiscountAmount || 0).toFixed(2)}</td>
                                        </tr>
                                      )}
                                      <tr style={{ borderBlock: "1px solid grey", padding: "4px 0" }}>
                                        <td style={{ padding: "4px 0", fontWeight: "bold" }}>Item total </td>
                                        <td style={{ padding: "4px 0", fontWeight: "bold" }}>$ {((item?.amount || 0) + (item?.shippingAmount || 0) - (item?.couponDiscountAmount || 0)).toFixed(2)}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center">
                              No items found for this order
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12 d-flex justify-content-end">
                  <table>
                    <tbody>
                      <tr>
                        <td style={{ padding: "4px 8px" }}>Subtotal : </td>
                        <td style={{ padding: "4px 8px" }}>$ {vendorTotals.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "4px 8px" }}>Shipping Total : </td>
                        <td style={{ padding: "4px 8px" }}>$ {vendorTotals.shippingTotal.toFixed(2)}</td>
                      </tr>
                      {items?.voucher_dicount > 0 && (
                        <tr>
                          <td style={{ padding: "4px 8px" }}>Voucher Discount : </td>
                          <td style={{ padding: "4px 8px" }}>-US$ {(items?.voucher_dicount || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ padding: "4px 8px" }}>Tax : </td>
                        <td style={{ padding: "4px 8px" }}>$ 0.00</td>
                      </tr>
                      <tr style={{ borderTop: "2px solid #000", fontWeight: "bold" }}>
                        <td style={{ padding: "8px" }}>Grand total : </td>
                        <td style={{ padding: "8px" }}>$ {(vendorTotals.subtotal - (items?.voucher_dicount || 0)).toFixed(2)}</td>
                      </tr>
                      {items?.wallet_used > 0 && (
                        <tr>
                          <td style={{ padding: "4px 8px" }}>Used Gift Card : </td>
                          <td style={{ padding: "4px 8px" }}>-US$ {(items?.wallet_used || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {items?.wallet_used > 0 && (
                        <tr>
                          <td style={{ padding: "4px 8px" }}>Pay By PayPal : </td>
                          <td style={{ padding: "4px 8px" }}>$ {(vendorTotals.subtotal - (items?.voucher_dicount || 0) - (items?.wallet_used || 0)).toFixed(2)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default OrderSlip;
