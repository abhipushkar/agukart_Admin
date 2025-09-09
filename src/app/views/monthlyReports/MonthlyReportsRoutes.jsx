import List from "./List";
import AffiliateUsers from "./AffiliateUsers";  
import { ROUTE_CONSTANT } from "app/constant/routeContanst";

export const MonthlyReportsRoutes = [
  { name: "monthly-reports", path: ROUTE_CONSTANT.affiliateUser.monthlyReports.list, element: <List /> },
  { name: "monthly-reports", path: ROUTE_CONSTANT.affiliateUser.monthlyReports.affiliateUsers, element: <AffiliateUsers /> }
];
