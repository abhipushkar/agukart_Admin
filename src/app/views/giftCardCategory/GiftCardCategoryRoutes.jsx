import Add from "./Add";
import List from "./List";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const GiftCardCategoryRoutes = [
  { name: "giftCardCategory", path: ROUTE_CONSTANT.giftCard.category.list, element: <List /> },
  { name: "giftCardCategory", path: ROUTE_CONSTANT.giftCard.category.add, element: <Add /> }
];
