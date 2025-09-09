import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import Add from "./Add";
import List from "./List";

export const PolicySettingroutes = [
  { name: "policySetting", path: ROUTE_CONSTANT.policySetting.list, element: <List /> },
  { name: "policySetting", path: ROUTE_CONSTANT.policySetting.add, element: <Add /> }
];
