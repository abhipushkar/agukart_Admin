import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, InputAdornment, OutlinedInput, TextField } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { useState } from "react";
import { useEffect } from "react";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { result } from "lodash";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import { toast } from "react-toastify";
export default function ProductParentTable({
  combinations,
  formdataaaaa,
  setSellerSku,
  sellerSky,
  variantArrValues,
  setVariantArrValue,
  setIsconponentLoader
}) {
  console.log("aaaaaaaasssssssssssssssssitemitem", formdataaaaa, combinations);
  const [sellerSkyValues, setSellerSkyValues] = React.useState(
    sellerSky ? sellerSky : Array(combinations.length).fill("")
  );
  const [debouneValue, setDebounceValue] = useState("");
  const [skuIndex, setSkuIndex] = useState(0);
  const [debounceData, setDebounceData] = useState(null);

  console.log("debouneValuedebouneValue", debouneValue);

  const handleSellerSkuChange = (index, event) => {
    const newSellerSkyValues = [...sellerSkyValues];
    newSellerSkyValues[index] = event.target.value;
    setSellerSkyValues(newSellerSkyValues);
    setSellerSku(newSellerSkyValues);
    setSkuIndex(index);
  };

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     setDebounceValue(sellerSkyValues[skuIndex]);
  //   }, 500);

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [sellerSkyValues[skuIndex]]);

  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  useEffect(() => {
    if (debouneValue) {
      const getProductDetail = async () => {
        try {
          setIsconponentLoader(true);
          let url = apiEndpoints.getProductBySku + `/${debouneValue}`;
          const res = await ApiService.get(url, auth_key);
          console.log(res, "getProductDetail res ponse");
          if (res.status === 200) {
            let obj = res.data.data;
            let sale_start_date = dayjs(obj.sale_start_date);
            let sale_end_date = dayjs(obj.sale_end_date);

            const newInputsFields = [...variantArrValues];
            newInputsFields[skuIndex] = { ...obj,_id:obj?.product_id,sale_start_date, sale_end_date };
            setVariantArrValue(newInputsFields);
          }
        } catch (error) {
          setIsconponentLoader(false);
          console.log(error);
          if (error) {
            const newInputsFields = [...variantArrValues];
            newInputsFields[skuIndex] = {
              _id: "",
              product_id:"",
              sale_price: "",
              price: "",
              sale_start_date: "",
              sale_end_date: "",
              qty: ""
            };
            setVariantArrValue(newInputsFields);
          }
        } finally {
          setIsconponentLoader(false);
        }
      };
      getProductDetail();
    }
  }, [debouneValue]);

  console.log({ sellerSkyValues });

  const handleVariantForm = (e, index) => {
    if (e.target.name === "qty") {
      if (/^\d*$/.test(e.target.value)) {
        const newInputsFields = [...variantArrValues];
        newInputsFields[index][e.target.name] = e.target.value;
        setVariantArrValue(newInputsFields);
      }
      return;
    }

    if (e.target.name === "price") {
      if (/^\d*$/.test(e.target.value)) {
        const newInputsFields = [...variantArrValues];
        newInputsFields[index][e.target.name] = e.target.value;
        setVariantArrValue(newInputsFields);
      }
      return;
    }

    if (e.target.name === "sale_price") {
      if (/^\d*$/.test(e.target.value)) {
        const newInputsFields = [...variantArrValues];
        newInputsFields[index][e.target.name] = e.target.value;
        setVariantArrValue(newInputsFields);
      }
      return;
    }
    const newInputsFields = [...variantArrValues];
    newInputsFields[index][e.target.name] = e.target.value;
    setVariantArrValue(newInputsFields);
  };

  useEffect(() => {
    let arr = [...variantArrValues];

    let length = combinations.length - arr.length;
    if (length >= 1) {
      setVariantArrValue((prv) => {
        const result = Array(length)
          .fill(null)
          .map((_, index) => {
            return {
              _id: "",
              product_id:"",
              sale_price: "",
              price: "",
              sale_start_date: "",
              sale_end_date: ""
            };
          });
        return [...prv, ...result];
      });
    }

    if (combinations.length === arr.length) {
      setVariantArrValue((prv) => prv);
    }

    if (combinations.length < arr.length) {
      length = arr.length - combinations.length;
      setVariantArrValue((prv) => {
        let newArr = [...prv];
        for (let i = 1; i <= length; i++) {
          newArr.pop();
        }
        return newArr;
      });
    }
  }, [combinations.length]);

  const dateHandler = (e, name, index) => {
    if (name === "sale_end_date") {
      const newInputsFields = [...variantArrValues];
      if (
        newInputsFields[index]?.sale_start_date &&
        e &&
        dayjs(e).isBefore(newInputsFields[index]?.sale_start_date)
      ) {
        toast.error("End Sale Date should be after Start Sale Date");
        newInputsFields[index][name] = null;
        return;
      }
    }
    const newInputsFields = [...variantArrValues];
    newInputsFields[index][name] = e;
    setVariantArrValue(newInputsFields);
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {formdataaaaa?.map((item) => {
              return (
                <>
                  <TableCell
                    key={item}
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    {item}
                  </TableCell>
                </>
              );
            })}
            {/* <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Gemstone Type
            </TableCell> */}
            {/* <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Ring Size
            </TableCell> */}
            <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Seller SKU
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Quantity
            </TableCell>
            {/* <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Images
            </TableCell> */}
            {/* <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Condition
            </TableCell> */}
            {/* <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Your Price
            </TableCell> */}

            <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Sale Price
            </TableCell>
            {/* <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Sale Start Date
            </TableCell> */}
            {/* <TableCell
              align="center"
              sx={{
                width: "230px"
              }}
            >
              Sale End Date
            </TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {combinations.map((item, index) => {
            console.log("wrereretsyditemitem", item);
            return (
              <>
                <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} key={index}>
                  {/* <TableCell align="center" component="th" scope="row">
                    {item?.key1}
                  </TableCell> */}
                  {formdataaaaa?.map((iddd, iindexx) => {
                    const dynamicKey = `key${iindexx + 1}`;

                    // console.log("dynamicKeydynamicKey", item[dynamicKey]?.value);

                    // console.log("dynamicKeydynamicKeydynamicKey", dynamicKey);

                    return (
                      <>
                        <TableCell align="center" component="th" scope="row">
                          {/* {`${"key"}${iindexx + 1}`} */}
                          {item[dynamicKey]?.value}
                          {/* {item[dynamicKey].value} */}
                          {/* {"key"${iindexx + 1}} */}
                        </TableCell>
                      </>
                    );
                  })}
                  {/* <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    jsjss
                  </TableCell> */}
                  {/* <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    jsjss
                  </TableCell> */}
                  <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    {/* <input
                      type="text"
                      value={sellerSkyValues[index]}
                      onChange={(e) => handleSellerSkuChange(index, e)}
                      onFocus={() => setSkuIndex(index)}
                      onBlur={(e) => setDebounceValue(sellerSkyValues[index])}
                      style={{
                        height: "30px",
                        width: "100px",
                        border: "2px solid green"
                      }}
                    /> */}

                    <FormControl fullWidth sx={{ m: 1 }} size="small">
                      <TextField
                        size="small"
                        value={sellerSkyValues[index]}
                        onChange={(e) => handleSellerSkuChange(index, e)}
                        onFocus={() => setSkuIndex(index)}
                        onBlur={(e) => setDebounceValue(sellerSkyValues[index])}
                        id="outlined-adornment-quantity"
                        placeholder="Seller SKU"
                      />
                    </FormControl>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    <FormControl fullWidth sx={{ m: 1 }} size="small">
                      <TextField
                        size="small"
                        name="qty"
                        value={variantArrValues[index]?.qty}
                        onChange={(e) => {
                          handleVariantForm(e, index);
                        }}
                        id="outlined-adornment-quantity"
                        placeholder="Quantity"
                      />
                    </FormControl>
                  </TableCell>

                  {/* <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px"
                      }}
                    >
                      <Box
                        sx={{
                          height: "40px",
                          width: "40px",
                          border: "2px dotted darkblue",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <AddAPhotoIcon />
                      </Box>
                      <Box>Add Image</Box>
                    </Box>
                  </TableCell> */}
                  {/* <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    <Box sx={{ minWidth: 120 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="demo-simple-select-label">Age</InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={age}
                          label="Age"
                          onChange={handleChange}
                        >
                          <MenuItem value={10}>Ten</MenuItem>
                          <MenuItem value={20}>Twenty</MenuItem>
                          <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </TableCell> */}
                  {/* <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    <FormControl fullWidth sx={{ m: 1 }} size="small">
                      <TextField
                        size="small"
                        name="price"
                        value={variantArrValues[index]?.price}
                        onChange={(e) => {
                          handleVariantForm(e, index);
                        }}
                        id="outlined-adornment-amount"
                        placeholder="Amount"
                      />
                    </FormControl>
                  </TableCell> */}
                  <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    <FormControl fullWidth sx={{ m: 1 }} size="small">
                      <TextField
                        size="small"
                        type="text"
                        name="sale_price"
                        onChange={(e) => {
                          handleVariantForm(e, index);
                        }}
                        value={variantArrValues[index]?.sale_price}
                        id="outlined-adornment-quantity"
                        placeholder="Sale Price"
                      />
                    </FormControl>
                  </TableCell>
                  {/* <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer
                        components={["DateField"]}
                        sx={{
                          paddingTop: "0",
                          justifyContent: "center"
                        }}
                      >
                        <DatePicker
                          label="Select Date"
                          value={
                            variantArrValues[index]?.sale_start_date
                              ? variantArrValues[index]?.sale_start_date
                              : null
                          }
                          onChange={(e) => dateHandler(e, "sale_start_date", index)}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  </TableCell> */}

                  {/* <TableCell
                    align="center"
                    sx={{
                      width: "230px"
                    }}
                  >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DemoContainer
                        components={["DateField"]}
                        sx={{
                          paddingTop: "0",
                          justifyContent: "center"
                        }}
                      >
                        <DatePicker
                          label="Select Date"
                          value={
                            variantArrValues[index]?.sale_end_date
                              ? variantArrValues[index]?.sale_end_date
                              : null
                          }
                          onChange={(e) => dateHandler(e, "sale_end_date", index)}
                        />
                      </DemoContainer>
                    </LocalizationProvider>
                  </TableCell> */}
                </TableRow>
              </>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
