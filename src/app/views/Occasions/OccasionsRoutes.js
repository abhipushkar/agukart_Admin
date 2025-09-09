import OccasionsList from "./OccasionsList";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const OccasionsRoutes = [
  { name: "OccasionsList", path: ROUTE_CONSTANT.catalog.occasions.list, element: <OccasionsList /> }
];
