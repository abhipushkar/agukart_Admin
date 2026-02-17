import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import List from "./list";
import Add from "./add";

export const urlRoutes = [
    { name: "URL", path: ROUTE_CONSTANT.catalog.url.list, element: <List /> },
    { name: "URL", path: ROUTE_CONSTANT.catalog.url.add, element: <Add /> }
]
