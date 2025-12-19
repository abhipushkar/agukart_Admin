import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { localStorageKey } from "app/constant/localStorageKey";

import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Info from "./Info";
import Member from "./Member";
import Story from "./Story";
import ConfirmModal from "app/components/ConfirmModal";
import Description from "./Description";
import ShopPolicy from "./ShopPolicy";

const EditVendorProfile = () => {
    const navigate = useNavigate();
    const auth_key = localStorage.getItem(localStorageKey.auth_key);
    const queryId = localStorage.getItem(localStorageKey.vendorId);

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
        shopAddress: "",
        shopAnnouncement: "",
        msgToBuyers: "",
        shopIcon: null,
        newShopName: "",
        memberData: [],
        description: "",
        headline: "",
        storyDesc: "",
        shopVideo: "",
        shopPhotos: []
    });
    const [shopData, setShopData] = useState([{ imgSrc: null, image: "", title: "" }]);

    const [images, setImages] = useState(null);
    const [, setImageSrc] = useState(null);

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
        shopAddress: "",
        shopAnnouncement: "",
        msgToBuyers: "",
        shopIcon: "",
        newShopName: "",
        memberData: "",
        headline: "",
        description: "",
        shopPolicy: "",
        storyDesc: "",
        shopVideo: "",
        shopPhotos: ""
    });

    const [checkInfo, setCheckInfo] = useState(false);
    const [checkDescription, setCheckDescription] = useState(false);
    const [checkShopPolicy, setCheckShopPolicy] = useState(false);
    const [checkMember, setCheckMember] = useState(false);
    const [imgUrls, setImgUrls] = useState({
        shopIconUrl: null
    });
    const [showVideo, setShowVideo] = useState(null);
    const [isDeleteVideo, setIsDeleteVideo] = useState(false);

    const [open, setOpen] = React.useState(false);
    const [type, setType] = useState("");
    const [route, setRoute] = useState(null);
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const logOut = useCallback(() => {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        setRoute(ROUTE_CONSTANT.login)
    }, []);

    const handleOpen = useCallback((type, msg) => {
        setMsg(msg?.message);
        setOpen(true);
        setType(type);
        if (msg?.response?.status === 401) {
            logOut()
        }
    }, [logOut]); // Added logOut to dependencies

    const handleClose = () => {
        setOpen(false);
        if (route !== null) {
            navigate(route);
        }
        setRoute(null);
        setMsg(null);
    };

    const getVendor = useCallback(async () => {
        try {
            const res = await ApiService.get(`${apiEndpoints.getVendorById}/${queryId}`, auth_key);
            if (res?.status === 200) {
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
                    description: resData?.vendorData?.description,
                    shopPolicy: resData?.vendorData?.shop_policy,
                    headline: resData?.vendorData?.story_headline,
                    storyDesc: resData?.vendorData?.story,
                    shopPhotos: resData?.vendorData?.shop_photos
                }));
                setImgUrls({ shopIconUrl: `${res?.data?.shopIconBaseUrl}${resData?.vendorData?.shop_icon}` })
                setShowVideo(resData?.vendorData?.shop_video ? `${res?.data?.shopVideoBaseUrl}${resData?.vendorData?.shop_video}` : "");
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
    }, [queryId, auth_key, handleOpen]);

    useEffect(() => {
        if (queryId) {
            getVendor();
        }
    }, [queryId, getVendor]);

    const [value, setValue] = useState("info");

    const handleValidate = (activeTab) => {
        const newErrors = {};
        switch (activeTab) {
            case "info":
                if (!formValues.shopTitle) newErrors.shopTitle = "Shop title is required";
                if (!formValues.shopAddress) newErrors.shopAddress = "Shop address is required";
                if (!imgUrls.shopIconUrl) newErrors.shopIcon = "Shop Icon is required";
                setErrors(newErrors);
                if (Object.keys(newErrors).length === 0) {
                    return true;
                }
                break;

            case "shop":
                if (!formValues.shopPolicy) newErrors.shopPolicy = "shop policy is required";
                setErrors(newErrors);
                if (Object.keys(newErrors).length === 0) {
                    return true;
                }
                break;

            case "members":
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
                console.log("Profile image uploaded");
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
                console.log("Shop icon uploaded");
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
                console.log("Shop video uploaded");
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
                    _id: queryId,
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
                if (formValues?.shopVideo && !isDeleteVideo) {
                    payload.isDeleteVideo = false;
                } else {
                    payload.isDeleteVideo = true;
                }
                const res = await ApiService.post(apiEndpoints.addVendor, payload, auth_key);
                if (res?.status === 200) {
                    if (images) {
                        handleUploadImg(res?.data?.user?._id);
                    }
                    if (formValues?.shopIcon) {
                        uploadShopIcon(res?.data?.user?._id);
                    }
                    if (formValues?.shopVideo) {
                        uploadStoryVideo(res?.data?.user?._id);
                    }
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
                            <Tab label="Shop Info" value="info" />
                            <Tab label="Shop Policy" value="shop" />
                            <Tab label="Members" value="members" />
                            <Tab label="Description" value="description" />
                            <Tab label="story" value="story" />
                        </TabList>
                    </Box>
                    <Box>
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
                                    setShopTab={() => { }}
                                    // setInfoTab={() => { }} // No info tab to enable
                                    queryId={queryId}
                                    loading={loading}
                                    handleVendorSave={handleSave}
                                />
                            </TabPanel>
                        )}
                        {value === "shop" && (
                            <TabPanel value="shop">
                                <ShopPolicy
                                    formValues={formValues}
                                    errors={errors}
                                    setFormValues={setFormValues}
                                    setErrors={setErrors}
                                    handleValidate={handleValidate}
                                    setValue={setValue}
                                    setCheckShopPolicy={setCheckShopPolicy}
                                    setMemberTab={() => { }} // No member tab to enable
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
                                    setDescriptionTab={() => { }} // No description tab to enable
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
                                    setStoryTab={() => { }} // No story tab to enable
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

export default EditVendorProfile;
