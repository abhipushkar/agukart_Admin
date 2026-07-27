import VendorBannerImage from "./VendorBannerImage";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const vendorBannerImageRoutes = [
    {
        name: "Vendor Banner Image",
        path: ROUTE_CONSTANT.vendorBannerImage.list,
        element: <VendorBannerImage />
    }
]
