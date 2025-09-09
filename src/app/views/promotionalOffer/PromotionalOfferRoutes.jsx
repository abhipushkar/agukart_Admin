import Add from "./Add";
import List from "./List";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const PromotionalOfferRoutes = [
  { name: "promotionalOffer", path: ROUTE_CONSTANT.catalog.promotionalOffer.list, element: <List /> },
  { name: "promotionalOffer", path: ROUTE_CONSTANT.catalog.promotionalOffer.add, element: <Add /> }
];
