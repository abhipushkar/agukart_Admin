import AddBlog from "./AddBlog";
import BlogList from "./BlogList";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const blogRoutes = [
  { name: "blog", path: ROUTE_CONSTANT.blog.list, element: <BlogList /> },
  { name: "blog", path: ROUTE_CONSTANT.blog.add, element: <AddBlog /> }
];
