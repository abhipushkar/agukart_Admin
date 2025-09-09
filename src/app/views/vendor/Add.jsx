import React, { useState } from "react";
import {
  Box,
  Paper,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";
import { useEffect } from "react";

import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Info from "./Info";
import Shop from "./Shop";
import Member from "./Member";
import Story from "./Story";
import ShopInfo from "./ShopInfo";
import ConfirmModal from "app/components/ConfirmModal";
import Description from "./Description";
import ShopPolicy from "./ShopPolicy";

const Add = () => {
  const navigate = useNavigate();
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    country: "",
    state: "",
    city: "",
    password: "",
    cPassword: "",
    mobileCode: "+91",
    mobileNo: "",
    shopTitle: "",
    shopAddress:"",
    shopAnnouncement: "",
    msgToBuyers: "",
    shopIcon: null,
    newShopName: "",
    memberData: [],
    description:"",
    headline: "",
    storyDesc: "",
    shopVideo: "",
    shopPhotos: []
  });
  const [shopData, setShopData] = useState([{ imgSrc: null, image: "", title: "" }]);

  const [images, setImages] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    country: "",
    state: "",
    city: "",
    password: "",
    cPassword: "",
    mobileNo: "",
    images: "",
    shopTitle: "",
    shopAddress:"",
    shopAnnouncement: "",
    msgToBuyers: "",
    shopIcon: "",
    newShopName: "",
    memberData: "",
    headline: "",
    description:"",
    shopPolicy:"",
    storyDesc: "",
    shopVideo: "",
    shopPhotos: ""
  });
  const [query, setQuery] = useSearchParams();
  const queryId = query.get("id");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [infoTab, setInfoTab] = useState(false);
  const [shopTab, setShopTab] = useState(false);
  const [memberTab, setMemberTab] = useState(false);
  const [descriptionTab,setDescriptionTab] = useState(false);
  const [shopPolicyTab,setShopPolicyTab] = useState(false);
  const [storyTab, setStoryTab] = useState(false);
  const [checkShopInfo, setCheckShopInfo] = useState(false);
  const [checkInfo, setCheckInfo] = useState(false);
  const [checkShop, setCheckShop] = useState(false);
  const [checkDescription,setCheckDescription] = useState(false);
  const [checkShopPolicy,setCheckShopPolicy] = useState(false);
  const [checkMember, setCheckMember] = useState(false);
  const [imgUrls, setImgUrls] = useState({
    shopIconUrl: null
  });
  const [showVideo, setShowVideo] = useState(null);
  const [isDeleteVideo,setIsDeleteVideo] = useState(false);
  console.log({isDeleteVideo})

  const [open, setOpen] = React.useState(false);
  const [type, setType] = useState("");
  const [route, setRoute] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

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

  console.log({ formValues });
  console.log({ errors });
  console.log({ shopData });

  const getVendor = async () => {
    try {
      const res = await ApiService.get(`${apiEndpoints.getVendorById}/${queryId}`, auth_key);
      if (res?.status === 200) {
        console.log("res-----", res);
        const resData = res?.data?.data;
        const membersWithImgSrc = resData?.vendorData?.members?.map((member) => ({
          ...member,
          imgSrc: `${res?.data?.shopPhotoBaseUrl}${member.images}`
        }));

        setFormValues((prev) => ({
          ...prev,
          name: resData?.name,
          email: resData?.email,
          gender: resData?.gender,
          dob: resData?.dob,
          country: resData?.country_id,
          state: resData?.state_id,
          city: resData?.city_id,
          password: resData?.showPassword,
          cPassword: resData?.showPassword,
          mobileNo: resData?.mobile,
          mobileCode: resData?.phone_code,
          shopTitle: resData?.vendorData?.shop_title,
          shopAnnouncement: resData?.vendorData?.shop_announcement,
          msgToBuyers: resData?.vendorData?.buyers_message,
          newShopName: resData?.vendorData?.shop_name,
          shopAddress: resData?.vendorData?.shop_address,
          memberData: membersWithImgSrc,
          description : resData?.vendorData?.description,
          shopPolicy : resData?.vendorData?.shop_policy,
          headline: resData?.vendorData?.story_headline,
          storyDesc: resData?.vendorData?.story,
          shopPhotos: resData?.vendorData?.shop_photos
        }));
        setImgUrls({shopIconUrl: `${res?.data?.shopIconBaseUrl}${resData?.vendorData?.shop_icon}`})
        setShowVideo(resData?.vendorData?.shop_video ?`${res?.data?.shopVideoBaseUrl}${resData?.vendorData?.shop_video}`:"");
        setImageSrc(resData?.image);
        const modifiedPhotos = resData?.vendorData?.shop_photos?.map((photo) => ({
          ...photo,
          imgSrc: `${res?.data?.shopPhotoBaseUrl}${photo.image}`
        }));
        setShopData(modifiedPhotos)
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  useEffect(() => {
    if (queryId) {
      getVendor();
      setInfoTab(true)
      setShopTab(true)
      setMemberTab(true)
      setDescriptionTab(true)
      setShopPolicyTab(true)
      setStoryTab(true)
      setCheckShopInfo(true)
      setCheckInfo(true)
      setCheckMember(true)
      setCheckDescription(true)
      setCheckShopPolicy(true)
      setCheckShop(true)
    } else {
      setFormValues({
        name: "",
        email: "",
        gender: "",
        dob: "",
        country: "",
        state: "",
        city: "",
        password: "",
        cPassword: "",
        mobileCode: "+91",
        mobileNo: "",
        shopTitle: "",
        shopAnnouncement: "",
        msgToBuyers: "",
        shopIcon: null,
        newShopName: "",
        description:"",
        shopPolicy:"",
        memberData: [],
        headline: "",
        storyDesc: "",
        shopVideo: "",
        shopPhotos: []
      });
      setImages(null);
      setImageSrc(null);
      setImgUrls({ shopIconUrl: null });
      setShopData([{ imgSrc: null, image: "", title: "" }]);
      setShowVideo(null)
      setValue("vendorInfo")
    }
  }, [queryId]);

  const [value, setValue] = useState("vendorInfo");

  const handleValidate = (activeTab) => {
    const newErrors = {};
    switch (activeTab) {
      case "vendorInfo":
        if (!formValues.name) newErrors.name = "Name is required";
        if (!formValues.email) newErrors.email = "Email is required";
        if (formValues.email && !emailRegex.test(formValues.email))
          newErrors.email = "Invalid Email";
        if (!formValues.gender) newErrors.gender = "Gender is required";
        if (!formValues.dob) newErrors.dob = "Date of Birth is required";
        if (!formValues.country) newErrors.country = "Country is required";
        if (!formValues.state) newErrors.state = "State is required";
        if (!formValues.city) newErrors.city = "City is required";
        if (!formValues.password) newErrors.password = "Password is required";
        if (formValues.password && formValues.password.length < 8)
          newErrors.password = "Password must be at least 8 characters";
        if (!formValues.cPassword) newErrors.cPassword = "Confirm Password is required";
        if (formValues.cPassword && formValues.password !== formValues.cPassword)
          newErrors.cPassword = "Confirm password must match the new password";
        if (!formValues.mobileNo) newErrors.mobileNo = "Mobile No is required";
        if (!imageSrc) newErrors.images = "Image is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
          return true;
        }
        break;

      case "info":
        if (!formValues.shopTitle) newErrors.shopTitle = "Shop title is required";
        if(!formValues.shopAddress) newErrors.shopAddress = "Shop address is required";
        if (!imgUrls.shopIconUrl) newErrors.shopIcon = "Shop Icon is required";
        // if (!formValues.shopAnnouncement)
          // newErrors.shopAnnouncement = "Shop Announcement is required";
        // if (!formValues.msgToBuyers) newErrors.msgToBuyers = "Message To Buyers is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
          return true;
        }
        break;

      case "shop":
        if (!formValues.newShopName) newErrors.newShopName = "Shop name is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
          return true;
        }
        break;

      case "shopPolicy":
        if (!formValues.shopPolicy) newErrors.shopPolicy = "shop policy is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
          return true;
        }
        break;

      case "members":
        // if (formValues?.memberData?.length <= 0) newErrors.memberData = "Members is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
          return true;
        }
        break;

      case "description":
        if (!formValues?.description || formValues?.description === "<p><br></p>") newErrors.description = "Description is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
          return true;
        }
        break;

      case "story":
        // if (!formValues.headline) newErrors.headline = "Story Headline is required";
        // if (!formValues.storyDesc || formValues.storyDesc === "<p><br></p>") newErrors.storyDesc = "story is required";
        // if (!showVideo) newErrors.shopVideo = "Shop Video is required";
        // if (
        //   // (shopData.length < 1 && !shopData[0].imgSrc) ||
        //   // (shopData.length < 1 && !shopData[0].title)
        //   !shopData[0]?.imgSrc || !shopData[0]?.title
        // )
        //   newErrors.shopPhotos = "Shop Photos is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
          return true;
        }
        break;

      default:
        return true;
    }
  };

  const handleTabChange = (event, newValue) => {
    switch (value) {
      case "vendorInfo":
        if (checkShopInfo === true) {
          if (handleValidate(value)) {
            setValue(newValue);
          } else setValue(value);
        } else {
          setValue(newValue);
        }
        break;

      case "info":
        if (checkInfo === true) {
          if (handleValidate(value)) {
            setValue(newValue);
          } else setValue(value);
        } else {
          setValue(newValue);
        }
        break;

      case "shop":
        if (checkShop === true) {
          if (handleValidate(value)) {
            setValue(newValue);
          } else setValue(value);
        } else {
          setValue(newValue);
        }
        break;

      case "shopPolicy":
        if (checkShopPolicy === true) {
          if (handleValidate(value)) {
            setValue(newValue);
          } else setValue(value);
        } else {
          setValue(newValue);
        }
        break;

      case "members":
        if (checkMember === true) {
          if (handleValidate(value)) {
            setValue(newValue);
          } else setValue(value);
        } else {
          setValue(newValue);
        }
        break;

        case "description":
          if (checkDescription === true) {
            if (handleValidate(value)) {
              setValue(newValue);
            } else setValue(value);
          } else {
            setValue(newValue);
          }
          break;

      default:
        setValue(newValue);
        break;
    }
  };

  
  const handleUploadImg = async (id) => {
    try {
      const formData = new FormData();
      formData.append("_id", id);
      formData.append("file", images);
      const res = await ApiService.postImage(apiEndpoints.addVendorProfile, formData, auth_key);
      if (res.status === 200) {
        console.log(res);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const uploadShopIcon = async (id) => {
    try {
      const formData = new FormData();
      formData.append("_id", id);
      formData.append("file", formValues?.shopIcon);
      const res = await ApiService.postImage(apiEndpoints.addShopIcon, formData, auth_key);
      if (res.status === 200) {
        console.log(res);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const uploadStoryVideo = async (id) => {
    try {
      const formData = new FormData();
      formData.append("_id", id);
      formData.append("video", formValues?.shopVideo);
      const res = await ApiService.postImage(apiEndpoints.addShopVideo, formData, auth_key);
      if (res.status === 200) {
        console.log(res);
      }
    } catch (error) {
      handleOpen("error", error);
    }
  };

  const handleSave = async () => {
    if (handleValidate("story")) {
      try {
        const filterMemberData = formValues?.memberData?.map(({ imgSrc, ...rest }) => rest);
        const filterShopData = shopData?.map(({ imgSrc, ...rest }) => rest);
        setLoading(true);
        let payload = {
          _id: queryId ? queryId : "new",
          name: formValues.name,
          mobile: formValues.mobileNo,
          email: formValues.email,
          gender: formValues.gender,
          dob: formValues.dob,
          phone_code: formValues.mobileCode,
          country_id: `${formValues.country}`,
          state_id: `${formValues.state}`,
          city_id: `${formValues.city}`,
          password: formValues.password,
          confirm_password: formValues.cPassword,
          shop_title: formValues.shopTitle,
          shop_address: formValues.shopAddress,
          shop_announcement: formValues.shopAnnouncement,
          buyers_message: formValues.msgToBuyers,
          shop_name: formValues.newShopName,
          members: filterMemberData,
          description: formValues.description,
          shop_policy: formValues.shopPolicy,
          story_headline: formValues.headline,
          story: formValues.storyDesc,
          shop_photos: filterShopData
        };
        if(formValues?.shopVideo && !isDeleteVideo){
          payload.isDeleteVideo = false;
        }else{
          payload.isDeleteVideo = true;
        }
        const res = await ApiService.post(apiEndpoints.addVendor, payload, auth_key);
        if (res?.status === 200) {
          // setFormValues("");
          // setImages(null);
          // setImageSrc(null);
          if (images) {
            handleUploadImg(res?.data?.user?._id);
          }
          if (formValues?.shopIcon) {
            uploadShopIcon(res?.data?.user?._id);
          }
          if (formValues?.shopVideo) {
            uploadStoryVideo(res?.data?.user?._id);
          }
          // navigate(ROUTE_CONSTANT.vendor.list);
          // if(!queryId) {
            setRoute(ROUTE_CONSTANT.vendor.list);
          // }
          handleOpen("success", res?.data);
        }
      } catch (error) {
        setLoading(false);
        handleOpen("error", error?.response?.data || error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ margin: "30px" }}>
      <Box sx={{ p: { lg: "24px", md: "24px", xs: "12px" } }} component={Paper}>
        <TabContext value={value}>
          <Box sx={{ maxWidth: { xs: 320, sm: 900 } }}>
            <TabList
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
            >
              <Tab label="Vendor Info" value="vendorInfo" />
              <Tab
                label="Shop Info"
                value="info"
                disabled={infoTab === false ? true : false}
              />
              <Tab label="Shop name" value="shop" disabled={shopTab === false ? true : false} />
              <Tab label="Shop Policy" value="shopPolicy" disabled={shopPolicyTab === false ? true : false} />
              <Tab label="Members" value="members" disabled={memberTab === false ? true : false} />
              <Tab label="Description" value="description" disabled={descriptionTab === false ? true : false} />
              <Tab label="story" value="story" disabled={storyTab === false ? true : false} />
            </TabList>
          </Box>
          <Box>
            {value === "vendorInfo" && (
              <TabPanel value="vendorInfo">
                <ShopInfo
                  formValues={formValues}
                  errors={errors}
                  setFormValues={setFormValues}
                  setErrors={setErrors}
                  setImages={setImages}
                  setImageSrc={setImageSrc}
                  imageSrc={imageSrc}
                  handleValidate={handleValidate}
                  setValue={setValue}
                  setInfoTab={setInfoTab}
                  setCheckShopInfo={setCheckShopInfo}
                  queryId={queryId}
                  loading={loading}
                  handleVendorSave={handleSave}
                />
              </TabPanel>
            )}
            {value === "info" && (
              <TabPanel value="info">
                <Info
                  formValues={formValues}
                  errors={errors}
                  setFormValues={setFormValues}
                  setErrors={setErrors}
                  handleValidate={handleValidate}
                  setValue={setValue}
                  imgUrls={imgUrls}
                  setImgUrls={setImgUrls}
                  setCheckInfo={setCheckInfo}
                  setShopTab={setShopTab}
                  queryId={queryId}
                  loading={loading}
                  handleVendorSave={handleSave}
                />
              </TabPanel>
            )}
            {value === "shop" && (
              <TabPanel value="shop">
                <Shop
                  formValues={formValues}
                  errors={errors}
                  setFormValues={setFormValues}
                  setErrors={setErrors}
                  handleValidate={handleValidate}
                  setValue={setValue}
                  setCheckShop={setCheckShop}
                  setShopPolicyTab={setShopPolicyTab}
                  queryId={queryId}
                  loading={loading}
                  handleVendorSave={handleSave}
                />
              </TabPanel>
            )}
             {value === "shopPolicy" && (
              <TabPanel value="shopPolicy">
                <ShopPolicy
                  formValues={formValues}
                  errors={errors}
                  setFormValues={setFormValues}
                  setErrors={setErrors}
                  handleValidate={handleValidate}
                  setValue={setValue}
                  setCheckShopPolicy={setCheckShopPolicy}
                  setMemberTab={setMemberTab}
                  queryId={queryId}
                  loading={loading}
                  handleVendorSave={handleSave}
                />
              </TabPanel>
            )}
            {value === "members" && (
              <TabPanel value="members">
                <Member
                  formValues={formValues}
                  errors={errors}
                  setFormValues={setFormValues}
                  setErrors={setErrors}
                  handleValidate={handleValidate}
                  setValue={setValue}
                  setCheckMember={setCheckMember}
                  setDescriptionTab={setDescriptionTab}
                  queryId={queryId}
                  loading={loading}
                  handleVendorSave={handleSave}
                />
              </TabPanel>
            )}
            {value === "description" && (
              <TabPanel value="description">
                <Description
                  formValues={formValues}
                  errors={errors}
                  setFormValues={setFormValues}
                  setErrors={setErrors}
                  handleValidate={handleValidate}
                  setValue={setValue}
                  setCheckDescription={setCheckDescription}
                  setStoryTab={setStoryTab}
                  queryId={queryId}
                  loading={loading}
                  handleVendorSave={handleSave}
                />
              </TabPanel>
            )}
            {value === "story" && (
              <TabPanel value="story">
                <Story
                  formValues={formValues}
                  errors={errors}
                  setFormValues={setFormValues}
                  setErrors={setErrors}
                  handleValidate={handleValidate}
                  shopData={shopData}
                  setShopData={setShopData}
                  images={images}
                  setImages={setImages}
                  setImageSrc={setImageSrc}
                  showVideo={showVideo}
                  setShowVideo={setShowVideo}
                  queryId={queryId}
                  loading={loading}
                  handleVendorSave={handleSave}
                  setIsDeleteVideo={setIsDeleteVideo}
                />
              </TabPanel>
            )}
          </Box>
        </TabContext>
      </Box>
      <ConfirmModal open={open} handleClose={handleClose} type={type} msg={msg} />
    </Box>
  );
};
export default Add;
