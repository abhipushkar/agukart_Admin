import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsCondition from "./TermsCondition";

export const informationRoutes = [
  { name: "information", path: ROUTE_CONSTANT.information.privacyPolicy, element: <PrivacyPolicy /> },
  { name: "information", path: ROUTE_CONSTANT.information.termsCondition, element: <TermsCondition /> },
];
