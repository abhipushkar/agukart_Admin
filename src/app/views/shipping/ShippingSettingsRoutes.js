import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ShippingSettings from "./ShippingSettings";
import Edit from "./Edit";

export const ShippingSettingsRoutes = [
  { name: "shippingSettings", path: ROUTE_CONSTANT.Shipping.ShippingSettings.list, element: <ShippingSettings /> },
  { name: "shippingSettings", path: ROUTE_CONSTANT.Shipping.ShippingSettings.edit, element: <Edit /> }
];
