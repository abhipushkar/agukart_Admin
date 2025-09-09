import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import Orders from "./Orders";
import OrderHistory from "./OrderHistory";
import OrderSlip from "./OrderSlip";

export const OrdersRoutes = [
  { name: "orders", path: ROUTE_CONSTANT.orders.orderPage, element: <Orders /> },
  { name: "orders", path: ROUTE_CONSTANT.orders.orderHistory, element: <OrderHistory /> },
  { name: "orders", path: ROUTE_CONSTANT.orders.orderSlip, element: <OrderSlip /> },
];