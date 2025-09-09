import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import AffiliateUsers from "./AffiliateUsers";
import Edit from "./Edit";

export const AffiliateRoutes = [
  { name: "affiliateUser", path: ROUTE_CONSTANT.affiliateUser.users.list, element: <AffiliateUsers /> },
  { name: "affiliateUser", path: ROUTE_CONSTANT.affiliateUser.users.edit, element: <Edit /> }
];
