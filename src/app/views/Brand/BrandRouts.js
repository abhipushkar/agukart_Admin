import BrandList from "./BrandList";
import AddBrand from "./AddBrand";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const BrandRoutes = [
  { name: "brand", path: ROUTE_CONSTANT.brand.list, element: <BrandList /> },
  { name: "brand", path: ROUTE_CONSTANT.brand.add, element: <AddBrand /> }
];
