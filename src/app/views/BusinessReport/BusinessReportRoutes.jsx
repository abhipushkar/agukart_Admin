import SalesAndTrafficReport from "./SalesAndTrafficReport";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ShopSalesReport from "./ShopSalesReport";
import SalesAndTrafficByChildItem from "./SalesAndTrafficByChildItem";
import SalesAndTrafficByParentItem from "./SalesAndTrafficByParentItem";
import NewUserReport from "./NewUserReport";
import CustomerReport from "./CustomerReport";
import GiftCardReport from "./GiftCardReport";

export const businessReportRoutes = [
  { name: "businessReport", path: ROUTE_CONSTANT.businessReport.salesAndTrafficReport, element: <SalesAndTrafficReport /> },
  { name: "businessReport", path: ROUTE_CONSTANT.businessReport.shopSalesReport, element: <ShopSalesReport /> },
  { name: "businessReport", path: ROUTE_CONSTANT.businessReport.salesAndTrafficByChildItem, element: <SalesAndTrafficByChildItem /> },
  { name: "businessReport", path: ROUTE_CONSTANT.businessReport.salesAndTrafficByParentItem, element: <SalesAndTrafficByParentItem /> },
  { name: "businessReport", path: ROUTE_CONSTANT.businessReport.newUserReport, element: <NewUserReport /> },
  { name: "businessReport", path: ROUTE_CONSTANT.businessReport.customerReport, element: <CustomerReport /> },
  { name: "businessReport", path: ROUTE_CONSTANT.businessReport.giftCardReport, element: <GiftCardReport /> },
];
