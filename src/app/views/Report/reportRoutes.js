import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ShopReport from "./ShopReport";
import ProductReport from "./ProductReport";
import ViewShopReport from "./ViewShopReport";
import ViewProductReport from "./ViewProductReport";


export const reportRoutes = [
  { name: "report", path: ROUTE_CONSTANT.report.shopReport, element: <ShopReport /> },
  { name: "report", path: ROUTE_CONSTANT.report.productReport, element: <ProductReport /> },
  { name: "report", path: ROUTE_CONSTANT.report.viewShopReport, element: <ViewShopReport /> },
  { name: "report", path: ROUTE_CONSTANT.report.viewProductReport, element: <ViewProductReport /> },

];
