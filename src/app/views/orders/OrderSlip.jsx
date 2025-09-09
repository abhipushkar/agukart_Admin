import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";

const OrderSlip = () => {
  const contentRef = useRef();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [query, setQuery] = useSearchParams();
  const ids = useMemo(() => query.getAll("id"), [query]);
  console.log({ids},"grghr4grgrert")
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
  const getOrderDetailForSlip = async ()=>{
    try {
        const payload = { _id: ids };
        const res = await ApiService.post(apiEndpoints.getOrderInvoice, payload, auth_key);
        if (res?.status === 200) {
          console.log(res);
          setInvoice(res?.data?.data);
          setBaseUrl(res?.data?.base_url);
        }
    } catch (error) {
      console.log("error", error);
    }
  }

  useEffect(()=>{
    if(ids?.length > 0){
      getOrderDetailForSlip();
    }
  },[ids])

  return (
    <>
      <div className="container-fluid" id="order-slip" ref={contentRef}>
        {invoice?.map((items, index) => (
          <div className="container mb-3" key={index} style={{ pageBreakAfter: "always" }}>
            <div className="row" style={{ borderBottom: "2px dashed #000", padding: "8px 0" }}>
              <div className="col-12">
                <h5>{items?.name}</h5>
                {/* <h5>House no</h5> */}
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
                {/* <h6>House no</h6> */}
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
                  Order ID : <span>{items?.order_id}</span>{" "}
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
                        <td>{items?.vendorData?.name}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <h6 className="fs-5 my-4">
              Thank you for buying from{" "}
              <span className="text-danger">{items?.vendorData?.name}</span> on{" "}
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
                      {items?.saleDetails?.map((item, i) => (
                        <tr key={i}>
                          <td>{item?.qty}</td>
                          <td className="text-center">
                            <img
                              src={`${baseUrl}/${item?.productData?.image[0]}`}
                              alt=""
                              className="img-fluid "
                              style={{ width: 100, height: 100 }}
                            />
                          </td>
                          <td>
                            <p>
                              {item?.productData?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                            </p>
                            <div>
                              <table>
                                <tbody>
                                  <tr>
                                    <td>Order Item ID :</td>
                                    <td>4348755847545</td>
                                  </tr>
                                  <tr>
                                    <td>SKU :</td>
                                    <td>{item?.productData?.sku_code}</td>
                                  </tr>
                                  {item?.isCombination === true &&
                                    item?.variantData?.map((variantItem, variantIndex) => (
                                      <tr key={variantIndex}>
                                        <td>{variantItem?.variant_name} :</td>
                                        <td>
                                          {
                                            item?.variantAttributeData[variantIndex]
                                              ?.attribute_value
                                          }
                                        </td>
                                      </tr>
                                    ))}
                                  <tr>
                                    <td>Engrave Name :</td>
                                    <td>Abhishek Mittal</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                          <td> $ {item?.productData?.sale_price} </td>
                          <td>
                            <div>
                              <table className="w-100">
                                <tbody>
                                  <tr>
                                    <td>Item Subtotal </td>
                                    <td>$ {item?.amount}</td>
                                  </tr>
                                  <tr>
                                    <td>Shipping total </td>
                                    <td>$ 4.98</td>
                                  </tr>
                                  <tr>
                                    <td>Tax </td>
                                    <td>$ 1.98</td>
                                  </tr>
                                  <tr>
                                    <td>Promotion : </td>
                                    <td>-US$ 1.98</td>
                                  </tr>
                                  <tr>
                                    <td>Coupon : </td>
                                    <td>-US$ 1.98</td>
                                  </tr>
                                  <tr style={{ borderBlock: "1px solid grey" }}>
                                    <td>Item total </td>
                                    <td>$ {item?.sub_total}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                      <td>Grand total : </td>
                      <td>$ {items?.subtotal}</td>
                    </tr>
                    <tr>
                      <td>Promotion : </td>
                      <td>-US$ 0.80</td>
                    </tr>
                    <tr>
                      <td>Coupon : </td>
                      <td>-US$ 0.80</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default OrderSlip;
