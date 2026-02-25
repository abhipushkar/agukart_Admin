import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import Orders from "./Orders";
import OrderHistory from "./OrderHistory";
import OrderSlip from "./OrderSlip";
import RefundPage from "./RefundPage";
import TrackingUploadStatus from "./TrackingUploadStatus";

export const OrdersRoutes = [
  { name: "orders", path: ROUTE_CONSTANT.orders.orderPage, element: <Orders /> },
  { name: "orders", path: ROUTE_CONSTANT.orders.orderHistory, element: <OrderHistory /> },
  { name: "orders", path: ROUTE_CONSTANT.orders.orderSlip, element: <OrderSlip /> },
  { name: "order-refund", path: ROUTE_CONSTANT.orders.orderRefund, element: <RefundPage /> },
  { name: "tracking-upload-status", path: ROUTE_CONSTANT.orders.trackingUploadStatus, element: <TrackingUploadStatus /> },
];