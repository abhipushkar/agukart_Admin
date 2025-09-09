import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import List from "./List";
import Add from "./Add";
export const adminCategoryRoutes = [
  { name: "adminCategory", path: ROUTE_CONSTANT.catalog.adminCategory.list, element: <List /> },
  { name: "adminCategory", path: ROUTE_CONSTANT.catalog.adminCategory.add, element: <Add /> },
];
