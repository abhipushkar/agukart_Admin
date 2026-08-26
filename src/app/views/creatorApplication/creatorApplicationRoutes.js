import View from "./View";
import List from "./List";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const creatorApplicationRoutes = [
    { name: "coupon", path: ROUTE_CONSTANT.creatorApplication.list, element: <List /> },
    { name: "coupon", path: ROUTE_CONSTANT.creatorApplication.view, element: <View /> }
];
