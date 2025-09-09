import Add from "./Add";
import BannerList from "./BannerList";
import Description from "./Description";
import List from "./List";
import PurchaesHistory from "./PurchaesHistory";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const GiftCardGiftRoutes = [
  { name: "giftCardGift", path: ROUTE_CONSTANT.giftCard.gift.list, element: <List /> },
  { name: "giftCardGift", path: ROUTE_CONSTANT.giftCard.gift.add, element: <Add /> },
  { name: "giftCardGift", path: ROUTE_CONSTANT.giftCard.bannerList.list, element: <BannerList /> },
  { name: "giftCardGift", path: ROUTE_CONSTANT.giftCard.description, element: <Description /> },
  { name: "giftCardGift", path: ROUTE_CONSTANT.giftCard.purchaesHistory, element: <PurchaesHistory /> }
];
