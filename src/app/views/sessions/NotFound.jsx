import { Box, Button, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Notfound from "./notFound.svg";
import { useEffect } from "react";
import { localStorageKey } from "app/constant/localStorageKey";

// STYLED COMPONENTS
const FlexBox = styled(Box)({
  display: "flex",
  alignItems: "center"
});

const JustifyBox = styled(FlexBox)({
  maxWidth: 320,
  flexDirection: "column",
  justifyContent: "center"
});

const IMG = styled("img")({
  width: "100%",
  marginBottom: "32px"
});

const NotFoundRoot = styled(FlexBox)({
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh !important"
});


export default function NotFound() {
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const designation_id = +localStorage.getItem(localStorageKey.designation_id);

  useEffect(() => {
    const isVendorRoute = pathname.includes('store');
    const isVendor = designation_id === 3;
    console.log(isVendorRoute, isVendor);
    if (isVendor && !isVendorRoute) {
      window.location.replace("/store/dashboard");
    }
  }, []);

  return (
    <NotFoundRoot>
      <JustifyBox>
        <IMG src={Notfound} alt="" />

        <Button
          color="primary"
          variant="contained"
          sx={{ textTransform: "capitalize" }}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </JustifyBox>
    </NotFoundRoot>
  );
}
