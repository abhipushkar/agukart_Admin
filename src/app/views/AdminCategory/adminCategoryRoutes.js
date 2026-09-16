import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import List from "./List";
import Add from "./Add";
import CategoryList from "./CategoryList";
export const adminCategoryRoutes = [
  { name: "adminCategory", path: ROUTE_CONSTANT.catalog.adminCategory.all, element: <List /> },
  { name: "adminCategory", path: ROUTE_CONSTANT.catalog.adminCategory.add, element: <Add /> },
  { name: "adminCategory", path: ROUTE_CONSTANT.catalog.adminCategory.list, element: <CategoryList /> },
];
