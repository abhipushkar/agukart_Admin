import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ShippingServiceList from "./List";
import AddShippingService from "./Add";

export const ShippingServiceRoutes = [
    { name: "URL", path: ROUTE_CONSTANT.shippingService.list, element: <ShippingServiceList /> },
    { name: "URL", path: ROUTE_CONSTANT.shippingService.add, element: <AddShippingService /> },
]