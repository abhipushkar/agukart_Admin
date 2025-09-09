import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import VariantList from "./VariantList";
import AddVariant from "./AddVariant";

export const VariantRoutes = [
  { name: "variant", path: ROUTE_CONSTANT.catalog.variant.list, element: <VariantList /> },
  { name: "variant", path: ROUTE_CONSTANT.catalog.variant.add, element: <AddVariant /> }
];
