import Add from "./Add";
import List from "./List";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const VoucherRoutes = [
  { name: "voucher", path: ROUTE_CONSTANT.voucher.list, element: <List /> },
  { name: "voucher", path: ROUTE_CONSTANT.voucher.add, element: <Add /> }
];
