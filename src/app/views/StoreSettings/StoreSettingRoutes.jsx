import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import StoreSettingList from "./StoreSettingList";
import Add from "./Add";

export const StoreSettingroutes = [
  { name: "storeSetting", path: ROUTE_CONSTANT.storeSetting.list, element: <StoreSettingList /> },
  { name: "storeSetting", path: ROUTE_CONSTANT.storeSetting.add, element: <Add /> }
];
