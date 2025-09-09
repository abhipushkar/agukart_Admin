import Add from "./Add";
import List from "./List";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const CouponRoutes = [
  { name: "coupon", path: ROUTE_CONSTANT.catalog.coupon.list, element: <List /> },
  { name: "coupon", path: ROUTE_CONSTANT.catalog.coupon.add, element: <Add /> }
];
