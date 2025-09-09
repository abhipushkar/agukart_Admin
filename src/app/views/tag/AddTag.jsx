import { Box, Button, Divider, Paper, Stack, TextField } from "@mui/material";
import { useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import AppsIcon from "@mui/icons-material/Apps";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { toast } from "react-toastify";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect } from "react";
import ConfirmModal from "app/components/ConfirmModal";

const AddTag = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");

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

  console.log({ title });

  const handleAddTag = async () => {
    if (!title) {
      setTitleError("Title is Required");
    } else {
      try {
        const payload = {
          _id: queryId ? queryId : "new",
          title: title
        };
        const res = await ApiService.post(apiEndpoints.addBlogTag, payload, auth_key);
        if (res?.status === 200) {
          console.log("res---", res);
          // navigate(ROUTE_CONSTANT.tag.list);
          // setTitle("");
          if(!queryId) {
            setRoute(ROUTE_CONSTANT.tag.list);
          }
          handleOpen("success", res?.data);
        }
      } catch (error) {
        handleOpen("error", error);
      }
    }
  };

  const getTag = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getBlogTagById}/${queryId}`, auth_key);
      if (res?.status === 200) {
        console.log("res-----", res?.data?.data);
        const resData = res?.data?.data;
        setTitle(resData?.title);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (queryId) {
      getTag();
    } else {
      setTitle("");
    }
  }, [queryId]);

  return (
    <>
      <Box sx={{ margin: "30px" }}>
        <Box sx={{ py: "16px", marginBottom: "20px" }} component={Paper}>
          <Stack sx={{ ml: "24px", mb: "12px" }} gap={1} direction={"row"}>
            <Box>
              <AppsIcon />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: "600", fontSize: "18px" }}>Go To</Typography>
            </Box>
          </Stack>
          <Divider />
          <Box sx={{ ml: "24px", mt: "16px" }}>
            <Button
              onClick={() => navigate(ROUTE_CONSTANT.tag.list)}
              startIcon={<AppsIcon />}
              variant="contained"
            >
              Tag List
            </Button>
          </Box>
        </Box>
        <Box sx={{ p: "24px" }} component={Paper}>
          <Box
            sx={{
              display: "flex",
              marginBottom: "40px",
              gap: "20px"
            }}
          >
            {/* <Box
            sx={{
              fontSize: "14px",
              fontWeight: "700",
              wordBreak: "normal",
              width: "20%",
              textWrap: "nowrap"
            }}
          >
            Title{" "}
            <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
              {" "}
              *
            </span>{" "}
            :
          </Box> */}
            <Box width={"100%"}>
              <Box
                sx={{
                  height: "auto", // Set your desired height
                  width: "100%"
                }}
              >
                <TextField
                  error={titleError && true}
                  helperText={titleError}
                  onBlur={() => {
                    if (!title) {
                      setTitleError("Title is Required");
                    }
                  }}
                  name="title"
                  label="Title"
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleError("");
                  }}
                  value={title}
                  rows={4}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      height: "40px"
                    },
                    "& .MuiFormLabel-root": {
                      top: "-7px"
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              marginTop: "15px",
              gap: "5px"
            }}
          >
            <Button variant="contained" onClick={handleAddTag}>
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </>
  );
};

export default AddTag;
