import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import Add from "./Add";
import List from "./List";

export const VendorRoutes = [
  { name: "vendor", path: ROUTE_CONSTANT.vendor.add, element: <Add /> },
  { name: "vendor", path: ROUTE_CONSTANT.vendor.list, element: <List /> }
];