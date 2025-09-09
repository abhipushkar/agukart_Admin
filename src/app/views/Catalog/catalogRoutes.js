import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import List from "./Category/List";
import Add from "./Category/Add";
export const catalogRoutes = [
  { name: "category", path: ROUTE_CONSTANT.catalog.category.list, element: <List /> },
  { name: "category", path: ROUTE_CONSTANT.catalog.category.add, element: <Add /> }
];
