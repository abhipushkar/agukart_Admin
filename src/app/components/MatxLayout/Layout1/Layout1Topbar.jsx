import { memo } from "react";
import { Link } from "react-router-dom";
import { localStorageKey } from "app/constant/localStorageKey";
import { useNavigate } from "react-router-dom";

import {
  Box,
  styled,
  Avatar,
  Hidden,
  useTheme,
  MenuItem,
  IconButton,
  useMediaQuery,
  Button
} from "@mui/material";
import { NotificationProvider } from "app/contexts/NotificationContext";
import useSettings from "app/hooks/useSettings";
import { Span } from "app/components/Typography";
import ShoppingCart from "app/components/ShoppingCart";
import { MatxMenu, MatxSearchBox } from "app/components";
import { NotificationBar } from "app/components/NotificationBar";
import { themeShadows } from "app/components/MatxTheme/themeColors";
import { topBarHeight } from "app/utils/constant";
import {
  Home,
  Menu,
  Person,
  Settings,
  WebAsset,
  MailOutline,
  StarOutline,
  PowerSettingsNew
} from "@mui/icons-material";
import { ApiService } from "app/services/ApiService";
import { apiEndpoints } from "app/constant/apiEndpoints";
import { useEffect } from "react";
import { useProfileData } from "app/contexts/profileContext";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import { REACT_APP_WEB_URL } from "config";

// STYLED COMPONENTS
const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.primary
}));

const TopbarRoot = styled("div")({
  top: 0,
  zIndex: 96,
  height: topBarHeight,
  boxShadow: themeShadows[8],
  transition: "all 0.3s ease"
});

const TopbarContainer = styled(Box)(({ theme }) => ({
  padding: "8px",
  paddingLeft: 18,
  paddingRight: 20,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: theme.palette.primary.main,
  [theme.breakpoints.down("sm")]: { paddingLeft: 16, paddingRight: 16 },
  [theme.breakpoints.down("xs")]: { paddingLeft: 14, paddingRight: 16 }
}));

const UserMenu = styled(Box)({
  padding: 4,
  display: "flex",
  borderRadius: 24,
  cursor: "pointer",
  alignItems: "center",
  "& span": { margin: "0 8px" }
});

const StyledItem = styled(MenuItem)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  minWidth: 185,
  "& a": {
    width: "100%",
    display: "flex",
    alignItems: "center",
    textDecoration: "none"
  },
  "& span": { marginRight: "10px", color: theme.palette.text.primary }
}));

const IconBox = styled("div")(({ theme }) => ({
  display: "inherit",
  [theme.breakpoints.down("md")]: { display: "none !important" }
}));

const Layout1Topbar = () => {
  const theme = useTheme();
  const { settings, updateSettings } = useSettings();

  const isMdScreen = useMediaQuery(theme.breakpoints.down("md"));

  const updateSidebarMode = (sidebarSettings) => {
    updateSettings({ layout1Settings: { leftSidebar: { ...sidebarSettings } } });
  };

  const handleSidebarToggle = () => {
    let { layout1Settings } = settings;
    let mode;
    if (isMdScreen) {
      mode = layout1Settings.leftSidebar.mode === "close" ? "mobile" : "close";
    } else {
      mode = layout1Settings.leftSidebar.mode === "full" ? "close" : "full";
    }
    updateSidebarMode({ mode });
  };
  const { logUserData,getProfileData } = useProfileData();
  console.log({logUserData})
  const auth_key = localStorage.getItem(localStorageKey.auth_key);
  const designation_id = localStorage.getItem(localStorageKey.designation_id);
  const admin_detail = JSON.parse(localStorage.getItem(localStorageKey.adminDetail));
  const navigate = useNavigate();
  const logoutHandler = async() => {
    try{
      const res = await ApiService.get(apiEndpoints.logout,auth_key);
      console.log(res);
      if (res.status === 200) {
        localStorage.removeItem(localStorageKey.auth_key);
        localStorage.removeItem(localStorageKey.designation_id);
        localStorage.removeItem(localStorageKey.vendorId);
        localStorage.removeItem(localStorageKey.adminDetail);
        navigate("/login");
      }
    }catch(error){
      console.log(error);
    }
  };
  
  useEffect(() => {
    getProfileData();
  }, []);

  const handleLoginAdmin = ()=>{
    localStorage.setItem(localStorageKey.auth_key,admin_detail?.auth_key );
    localStorage.setItem(localStorageKey.designation_id, admin_detail?.designation_id);
    localStorage.removeItem(localStorageKey.vendorId);
    localStorage.removeItem(localStorageKey.adminDetail);
    navigate("/login");
  }

  return (
    <TopbarRoot>
      <TopbarContainer>
        <Box display="flex">
          <StyledIconButton onClick={handleSidebarToggle}>
            <Menu />
          </StyledIconButton>
          {
            designation_id == "3" && <Button variant="contained" color="primary" onClick={()=>{
              window.open(`${REACT_APP_WEB_URL}/store/${logUserData?.vendor?.slug}`, "_blank");
            }}>
              View Shop
            </Button>
          }
          {/* 
          <IconBox>
            <StyledIconButton>
              <MailOutline />
            </StyledIconButton>

            <StyledIconButton>
              <WebAsset />
            </StyledIconButton>

            <StyledIconButton>
              <StarOutline />
            </StyledIconButton>
          </IconBox> */}
        </Box>

        <Box display="flex" alignItems="center">
          {/* <MatxSearchBox />
          <NotificationProvider>
            <NotificationBar />
          </NotificationProvider>

          <ShoppingCart /> */}
          {
            admin_detail && <Button variant="contained" color="primary" onClick={handleLoginAdmin}>
              Login As Admin
            </Button>
          }
          <MatxMenu
            menuButton={
              <UserMenu>
                <Hidden xsDown>
                  <Span>
                    Hi <strong>{logUserData?.vendor?.shop_name || logUserData?.name}</strong>
                  </Span>
                </Hidden>
                <Avatar src={logUserData?.vendor?.shop_icon ? `${logUserData?.shopImageUrl}${logUserData?.vendor?.shop_icon}` : "user.avatar"} sx={{ cursor: "pointer" }} />
              </UserMenu>
            }
          >
            <StyledItem>
              <Link to="/dashboard">
                <Home />
                <Span>Home</Span>
              </Link>
            </StyledItem>

            {/* <StyledItem>
              <Link to="/page-layouts/user-profile">
                <Person />
                <Span>Profile</Span>
              </Link>
            </StyledItem> */}

            <StyledItem onClick={() => navigate(ROUTE_CONSTANT.account)}>
              <Settings />
              <Span>Settings</Span>
            </StyledItem>

            <StyledItem onClick={logoutHandler}>
              <PowerSettingsNew />
              <Span>Logout</Span>
            </StyledItem>
          </MatxMenu>
        </Box>
      </TopbarContainer>
    </TopbarRoot>
  );
};

export default memo(Layout1Topbar);
