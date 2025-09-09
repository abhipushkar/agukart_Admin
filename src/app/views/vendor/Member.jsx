import React, { useRef, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  Autocomplete,
  Chip,
  IconButton,
  CircularProgress
} from "@mui/material";
import ReorderIcon from "@mui/icons-material/Reorder";
import AddIcon from "@mui/icons-material/Add";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ConfirmModal from "app/components/ConfirmModal";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { ApiService } from "app/services/ApiService";
import { localStorageKey } from "app/constant/localStorageKey";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { useNavigate } from "react-router-dom";

const Member = ({
  formValues,
  setFormValues,
  errors,
  setErrors,
  handleValidate,
  setValue,
  setCheckMember,
  setDescriptionTab,
  queryId,
  loading,
  handleVendorSave
}) => {
  const inputFileRef = useRef(null);
  const navigate = useNavigate()
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [openForm, setOpenForm] = useState(false);
  const [members, setMembers] = useState({
    images: "",
    imgSrc: null,
    name: "",
    bio: "",
    roles: []
  });
  const [inputValue, setInputValue] = useState("");
  const [indexing, setIndexing] = useState(null);
  const [formHeading, setFormHeading] = useState("");

  const [memErrors, setMemErrors] = useState({
    images: "",
    name: "",
    bio: "",
    roles: ""
  });
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");

  const logOut = () => {
    localStorage.removeItem(localStorageKey.auth_key);
    localStorage.removeItem(localStorageKey.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    navigate(ROUTE_CONSTANT.login);
  };

  const handleClose = () => {
    setOpen(false);
    setIndexing(null);
  };

  const handleOpen = (type) => {
    setOpen(true);
    setType(type);
  };
  console.log({ members });

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   setMembers((prev) => ({ ...prev, images: file }));
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       setMembers((prev) => ({ ...prev, imgSrc: event.target.result }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    // setMembers((prev) => ({ ...prev, images: file }));
    if (file) {
      // const reader = new FileReader();
      // reader.onload = (event) => {
      //   setMembers((prev) => ({ ...prev, imgSrc: event.target.result }));
      // };
      // reader.readAsDataURL(file);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await ApiService.postImage(apiEndpoints.addShopPhotos, formData, auth_key);
        if (res?.status === 200) {
          console.log("resShopPhotos", res);
          const reader = new FileReader();
          reader.onload = (event) => {
            setMembers((prev) => ({ ...prev, images: res?.data?.fileName, imgSrc: event.target.result }));
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.log(error);
        if (error?.response?.status === 401) {
          logOut();
        }
      }
    }
  };

  const handleAddRole = (event) => {
    if (event.key === "Enter" && inputValue.trim() !== "") {
      const updatedRoles = [...roles, inputValue.trim()];
      setRoles(updatedRoles);
      setMembers((prev) => ({ ...prev, roles: updatedRoles }));
      setInputValue("");
      event.preventDefault();
    }
  };

  const handleDelete = (roleToDelete) => {
    const updatedRoles = roles.filter((role) => role !== roleToDelete);
    setRoles(updatedRoles);
    setMembers((prev) => ({ ...prev, roles: updatedRoles }));
  };

  const handleNext = () => {
    if (handleValidate("members")) {
      setValue("description");
      setCheckMember(true);
      setDescriptionTab(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMembers((prev) => ({ ...prev, [name]: value }));
    setMemErrors((prv) => ({ ...prv, [name]: "" }));
  };

  const handleSave = () => {
    const error = {};
    if (!members.imgSrc) error.images = "Image is required";
    if (!members.name) error.name = "Name is required";
    if (!members.bio) error.bio = "Bio is required";
    if (members.roles.length <= 0) error.roles = "Roles is required";
    setMemErrors(error);

    if (Object.keys(error).length === 0) {
      if (indexing !== null) {
        setFormValues((prev) => ({
          ...prev,
          memberData: prev.memberData.map((item, index) =>
            index === indexing - 1 ? members : item
          )
        }));
      } else {
        setFormValues((prev) => ({
          ...prev,
          memberData: [...(prev.memberData || []), members]
        }));
      }

      setOpenForm(false);
      setMembers({
        images: "",
        imgSrc: null,
        name: "",
        bio: "",
        roles: []
      });
      setRoles([]);
      setInputValue("");
      setIndexing(null);
    }
  };

  const handleDeleteMember = () => {
    const updatedMemberData = formValues.memberData.filter((_, index) => index !== indexing);
    setFormValues((prev) => ({
      ...prev,
      memberData: updatedMemberData
    }));
    setIndexing(null);
  };

  const handleEdit = (item, id) => {
    setOpenForm(true);
    setFormHeading("Update Shop Member");
    setIndexing(id + 1);
    setMembers({
      images: item?.images,
      imgSrc: item?.imgSrc,
      name: item?.name,
      bio: item?.bio,
      roles: item?.roles
    });
    setRoles(item?.roles);
  };

  return (
    <>
      <h2 style={{ marginBottom: "5px", marginTop: "0" }}>Shop Members</h2>
      <Typography sx={{ color: "#000" }}>
        Let us know{" "}
        <Link href="#" sx={{ textDecoration: "underline", color: "#000" }}>
          who helps with making your items and running your shop
        </Link>
      </Typography>
      <Typography sx={{ color: "#000" }}>
        People listed here will appear on your shop's public about page. owners will also appear on
        your listing pages.
      </Typography>
      <Box p={3}>
        {errors.memberData && formValues?.memberData?.length <= 0 && (
          <Typography
            sx={{
              fontSize: "12px",
              color: "#FF3D57",
              marginLeft: "14px",
              marginRight: "14px",
              marginTop: "3px"
            }}
          >
            {errors.memberData}
          </Typography>
        )}
        {formValues?.memberData?.length > 0 && (
          <Box p={2} sx={{ border: "1px solid #d4d4d4", borderRadius: "6px" }}>
            {formValues?.memberData?.map((item, index) => (
              <Grid
                container
                spacing={3}
                pb={2}
                mb={2}
                alignItems={"center"}
                sx={{
                  borderBottom: "1px solid #d4d4d4",
                  margin: "0",
                  width: "100%",
                  paddingTop: "10px"
                }}
                key={index}
              >
                <Grid lg={5} md={5} xs={12} mb={1} sx={{ paddingRight: "16px" }}>
                  <Typography
                    component="div"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: { lg: "start", md: "start", xs: "center" }
                    }}
                  >
                    <Typography component="span" pr={2}>
                      <ReorderIcon sx={{ color: "gray" }} />
                    </Typography>
                    <Typography
                      component="div"
                      sx={{
                        display: { lg: "flex", md: "flex", xs: "block" },
                        alignItems: "center"
                      }}
                    >
                      <Typography component="span">
                        <img
                          src={item?.imgSrc}
                          style={{
                            borderRadius: "50%",
                            width: "100px",
                            height: "100px",
                            objectFit: "cover"
                          }}
                          alt=""
                        />
                      </Typography>
                      <Typography component="span" pl={2}>
                        <Typography fontSize={16} fontWeight={500}>
                          <Link sx={{ textDecoration: "none", color: "#000" }}>{item?.name}</Link>
                        </Typography>
                        <Typography>
                          {" "}
                          {item?.roles?.map((role, i) => (
                            <span key={i}>
                              {role}
                              {i < item.roles.length - 1 ? ", " : ""}
                            </span>
                          ))}{" "}
                        </Typography>
                      </Typography>
                    </Typography>
                  </Typography>
                </Grid>
                <Grid lg={4} md={4} xs={12} mb={1} sx={{ paddingRight: "16px" }}>
                  <Typography
                    textAlign={{ lg: "start", md: "start", xs: "center" }}
                    fontSize={16}
                    fontWeight={600}
                  >
                    {item?.bio}
                  </Typography>
                </Grid>
                <Grid lg={3} md={3} xs={12} mb={1} sx={{ paddingRight: "16px" }}>
                  <Typography component="div" textAlign={"center"} mt={2}>
                    <Button
                      sx={{
                        marginLeft: "10px",
                        background: "#fff",
                        border: "1px solid #000",
                        borderRadius: "5px",
                        color: "#000",
                        padding: "6px 18px",
                        "&:hover": { background: "#000", color: "#fff" }
                      }}
                      onClick={() => handleEdit(item, index)}
                    >
                      Edit
                    </Button>
                    <Button
                      sx={{
                        marginLeft: "10px",
                        background: "#fff",
                        border: "1px solid #ff0000",
                        borderRadius: "5px",
                        color: "#000",
                        padding: "6px 18px",
                        "&:hover": { background: "#ff0000", color: "#fff" }
                      }}
                      onClick={() => {
                        handleOpen("deleteMember");
                        setIndexing(index);
                      }}
                    >
                      Delete
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Box>
        )}
        {openForm !== true ? (
          <Box
            p={4}
            mt={3}
            textAlign={"center"}
            sx={{ borderRadius: "6px", background: "#eeeeee" }}
          >
            <Typography component="div">
              <Button
                sx={{ background: "none !important", color: "#000" }}
                onClick={() => {
                  setOpenForm(true);
                  setFormHeading("Add Shop Member");
                }}
              >
                <AddIcon sx={{ fontSize: "30px" }} />
              </Button>
            </Typography>
            <Typography mt={1} fontSize={16} fontWeight={600}>
              <Link
                onClick={() => {
                  setOpenForm(true);
                  setFormHeading("Add Shop Member");
                }}
                sx={{ textDecoration: "underline", color: "#000" }}
              >
                Add Shop member
              </Link>
            </Typography>
          </Box>
        ) : (
          <Box mt={3} mb={3} border={"1px solid #b9b9b9"} borderRadius={"6px"} overflow={"hidden"}>
            <Typography
              component="div"
              fontWeight={600}
              fontSize={17}
              borderBottom={"1px solid 1px solid #b9b9b9"}
              bgcolor={"#e4e4e4"}
              p={2}
            >
              {formHeading}
            </Typography>
            <Box p={2}>
              <Grid container spacing={3} sx={{ margin: "0", width: "100%" }}>
                <Grid lg={2} md={3} xs={12} mb={1} sx={{ paddingRight: "16px" }}>
                  <Typography
                    component="div"
                    textAlign={{ lg: "start", md: "start", xs: "center" }}
                  >
                    <Typography pb={2} fontWeight={600} fontSize={15}>
                      Portrait
                    </Typography>
                    <Typography
                      component="div"
                      sx={{
                        margin: { lg: "0", md: "0", xs: "0 auto" },
                        width: "150px",
                        position: "relative"
                      }}
                    >
                      {members?.imgSrc && (
                        <img
                          src={members?.imgSrc}
                          style={{
                            borderRadius: "50%",
                            width: "150px",
                            height: "150px",
                            objectFit: "cover"
                          }}
                          alt=""
                        />
                      )}
                      {!members?.imgSrc ? (
                        <Typography textAlign={"center"}>
                          <IconButton aria-label="add" onClick={() => inputFileRef.current.click()}>
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Typography>
                      ) : (
                        <Typography textAlign={"center"}>
                          <Link
                            onClick={() => inputFileRef.current.click()}
                            sx={{ textDecoration: "underline", color: "#000", fontWeight: "600" }}
                          >
                            Change photo
                          </Link>
                        </Typography>
                      )}
                      {memErrors.images && (
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "#FF3D57",
                            marginLeft: "14px",
                            marginRight: "14px",
                            marginTop: "3px"
                          }}
                        >
                          {memErrors.images}
                        </Typography>
                      )}
                      <input
                        ref={inputFileRef}
                        onChange={handleFileChange}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                    </Typography>
                  </Typography>
                </Grid>
                <Grid lg={4} md={3} xs={12} mb={1} sx={{ paddingRight: "16px" }}>
                  <Box>
                    <Typography component="div">
                      <Typography pb={1} fontWeight={600} fontSize={15}>
                        Name
                      </Typography>
                      <TextField
                        error={memErrors.name && true}
                        helperText={memErrors.name}
                        onBlur={() => {
                          if (!members.name) {
                            setMemErrors((prv) => ({ ...prv, name: "Name is Required" }));
                          }
                        }}
                        type="text"
                        value={members.name}
                        onChange={handleChange}
                        name="name"
                        sx={{
                          width: "100%",
                          "& .MuiInputBase-root": {
                            height: "40px"
                          }
                        }}
                      />
                      <Typography textAlign={"end"}>0/144</Typography>
                    </Typography>
                    <Typography component="div" mt={2}>
                      <Typography pb={1} fontWeight={600} fontSize={15}>
                        Roles
                      </Typography>
                      <Typography component="div">
                        <Autocomplete
                          multiple
                          freeSolo
                          options={[]}
                          value={roles}
                          inputValue={inputValue}
                          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
                          onKeyDown={handleAddRole}
                          onChange={(event, newValue) => {
                            setRoles(newValue);
                            setMembers((prev) => ({ ...prev, roles: newValue }));
                            setMemErrors((prev) => ({ ...prev, roles: "" }));
                          }}
                          onBlur={() => {
                            if (roles?.length <= 0) {
                              setMemErrors((prev) => ({ ...prev, roles: "Roles is required" }));
                            }
                          }}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                variant="outlined"
                                label={option}
                                {...getTagProps({ index })}
                                onDelete={() => handleDelete(option)}
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="outlined"
                              label="Add Roles"
                              placeholder="Type and press Enter to add roles"
                            />
                          )}
                        />
                        {memErrors.roles && (
                          <Typography
                            sx={{
                              fontSize: "12px",
                              color: "#FF3D57",
                              marginLeft: "14px",
                              marginRight: "14px",
                              marginTop: "3px"
                            }}
                          >
                            {memErrors.roles}
                          </Typography>
                        )}
                      </Typography>
                    </Typography>
                  </Box>
                </Grid>
                <Grid lg={6} md={6} xs={12} mb={1} sx={{ paddingRight: "16px" }}>
                  <Typography component="div">
                    <Typography pb={1} fontWeight={600} fontSize={15}>
                      Bio
                    </Typography>
                    <TextField
                      multiline
                      fullWidth
                      rows={4}
                      error={memErrors.bio && true}
                      helperText={memErrors.bio}
                      onBlur={() => {
                        if (!members.bio) {
                          setMemErrors((prv) => ({ ...prv, bio: "Bio is Required" }));
                        }
                      }}
                      type="text"
                      value={members.bio}
                      onChange={handleChange}
                      name="bio"
                    />
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Typography component="div" p={2} textAlign={"end"}>
              <Button
                sx={{
                  background: "#000",
                  border: "none",
                  borderRadius: "5px",
                  color: "#fff",
                  padding: "6px 18px",
                  "&:hover": { background: "#545454" }
                }}
                onClick={handleSave}
              >
                Save
              </Button>
            </Typography>
          </Box>
        )}
      <Typography component="div" mt={2} textAlign="end">
        {queryId && (
          <Button
            endIcon={loading ? <CircularProgress size={15} color="inherit" /> : null}
            disabled={loading}
            onClick={handleVendorSave}
            sx={{
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "8px 18px",
              fontWeight: 500,
              textTransform: "capitalize",
              marginRight: 2,
              "&:hover": {
                backgroundColor: "#333",
              },
              "&:disabled": {
                backgroundColor: "#888",
              },
            }}
          >
            Save
          </Button>
        )}
        <Button
          onClick={handleNext}
          sx={{
            backgroundColor: "#43a047", // green
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 18px",
            fontWeight: 500,
            textTransform: "capitalize",
            "&:hover": {
              backgroundColor: "#388e3c",
            },
          }}
        >
          Next
        </Button>
      </Typography>

      </Box>
      <ConfirmModal
        open={open}
        handleClose={handleClose}
        type={type}
        handleDelete={handleDeleteMember}
      />
    </>
  );
};

export default Member;
