import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import TagList from "./TagList";
import AddTag from "./AddTag";

export const tagRoutes = [
  { name: "blog", path: ROUTE_CONSTANT.tag.list, element: <TagList /> },
  { name: "blog", path: ROUTE_CONSTANT.tag.add, element: <AddTag /> }
];
