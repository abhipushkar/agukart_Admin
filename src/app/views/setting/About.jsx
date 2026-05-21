import React from "react";
import {
  TextField,
  Button,
  Stack,
  Box,
  Container as MuiContainer,
  InputAdornment,
  CircularProgress,
  Autocomplete
} from "@mui/material";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import styled from "@emotion/styled";
import { useState } from "react";
import { localStorageKey } from "app/constant/localStorageKey";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { toast } from "react-toastify";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCallback } from "react";
import ConfirmModal from "app/components/ConfirmModal";
import QuillDes from "app/components/ReactQuillTextEditor/SingleReactQuillTextEditor/QuilDes";
import SingleTextEditor from "app/components/TextEditor/SingleTextEditor";

const theme = createTheme();

const StyledContainer = styled("div")(({ theme }) => ({
  margin: "30px",
  [theme.breakpoints.down("sm")]: { margin: "16px" },
  "& .breadcrumb": {
    marginBottom: "30px",
    [theme.breakpoints.down("sm")]: { marginBottom: "16px" }
  }
}));

const About = () => {
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [id, setId] = useState("");
  const [des, setDes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const navigate = useNavigate();
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    setRoute(ROUTE_CONSTANT.login)
  };

  const handleOpen = (type, msg) => {
    setMsg(msg?.message);
    setOpen(true);
    setType(type);
    if (msg?.response?.status === 401) {
      logOut()
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
  const parseKeyword = (term) => {
    if (Array.isArray(term)) return term.map(t => t.trim());
    if (typeof term === "string") return term.trim().split(",").map(t => t.trim()).filter(Boolean);
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !metaKeywords.includes(trimmed)) {
      setMetaKeywords((prev) => [...prev, ...parseKeyword(trimmed)]);
    }
    setKeywordInput("");
  };

  const handleDeleteKeyword = (kwToDelete) => () => {
    setMetaKeywords((prev) => prev.filter((k) => k !== kwToDelete));
  };
  const handleSubmit = async () => {
    if (!des) {
      setErrors("Description is required");
    } else {
      try {
        setLoading(true);
        const payload = {
          _id: id ? id : "new",
          type: "About Agukart",
          description: des,
          meta_title: metaTitle,
          meta_description: metaDescription,
          meta_keywords: metaKeywords,
        };
        const res = await ApiService.post(apiEndpoints.updateSettings, payload, auth_key);
        if (res?.status === 200) {
          handleOpen("success", res?.data);
        }
      } catch (error) {
        setLoading(false);
        handleOpen("error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getInformation = useCallback(async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getSettings}/about-agukart`, auth_key);
      if (res?.status === 200) {
        const resData = res?.data?.data;
        setDes(resData?.description);
        setId(resData?._id);
        setMetaTitle(resData?.meta_title || "");
        setMetaDescription(resData?.meta_description || "");
        setMetaKeywords(Array.isArray(resData?.meta_keywords) ? resData.meta_keywords : []);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  }, [auth_key]);

  useEffect(() => {
    getInformation();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <MuiContainer>
        <StyledContainer>
          <h2>About</h2>
          <form>
            <Box width={"100%"}>
              <Box
                sx={{
                  height: "auto", // Set your desired height
                  width: "100%"
                }}
              >
                <QuillDes des={des} setDes={setDes} setErrors={setErrors} />
              </Box>
              {/* <SingleTextEditor value={des} setDescription={setDes}/> */}
              {errors && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#FF3D57",
                    marginLeft: "14px",
                    marginRight: "14px",
                    marginTop: "3px"
                  }}
                >
                  {errors}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "60px" }}>
              <TextField
                label="Meta Title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                sx={{ width: "100%", "& .MuiInputBase-root": { height: "40px" }, "& .MuiFormLabel-root": { top: "-7px" } }}
              />
              <TextField
                label="Meta Description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                multiline
                rows={3}
                sx={{ width: "100%" }}
              />
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={metaKeywords}
                inputValue={keywordInput}
                onChange={(event, newValue) => {
                  const parsed = newValue.reduce((acc, option) => acc.concat(parseKeyword(option)), []);
                  setMetaKeywords(parsed);
                }}
                onInputChange={(e, newInputValue) => setKeywordInput(newInputValue)}
                onBlur={() => { if (keywordInput.trim()) handleAddKeyword(); }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} onDelete={handleDeleteKeyword(option)} size="small" />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Meta Keyword"
                    placeholder="Add Keywords"
                    sx={{ width: "100%", "& .MuiInputBase-root": { padding: "0 11px" }, "& .MuiFormLabel-root": { top: "-7px" } }}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleAddKeyword(); }
                      if (e.key === ",") { e.preventDefault(); handleAddKeyword(); setKeywordInput(""); }
                      if (e.key === "Backspace" && !keywordInput) {
                        setMetaKeywords((prev) => prev.slice(0, -1));
                      }
                    }}
                  />
                )}
              />
            </Box>
            <Button
              endIcon={loading ? <CircularProgress size={15} /> : ""}
              disabled={loading ? true : false}
              sx={{ mr: "16px", mt: "60px" }}
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </form>
        </StyledContainer>
      </MuiContainer>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </ThemeProvider>
  );
};

export default About;
