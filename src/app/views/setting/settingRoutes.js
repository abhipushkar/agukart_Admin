import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import HomePage from "./HomePage";
import CountryAccessPage from "./CountryAccessPage";
import OurTopBrands from "./OurTopBrands";
import OurTopStore from "./OurTopStore";
import Wholesale from "./Wholesale";
import About from "./About";
import ContactShop from "./ContactShop";
import ContactUs from "./ContactUs";
import Affiliate from "./Affiliate";

export const settingRoutes = [
  { name: "setting", path: ROUTE_CONSTANT.setting.homepage, element: <HomePage /> },
  { name: "setting", path: ROUTE_CONSTANT.setting.countryAccessSettings, element: <CountryAccessPage /> },
  { name: "setting", path: ROUTE_CONSTANT.setting.ourTopBrands, element: <OurTopBrands /> },
  { name: "setting", path: ROUTE_CONSTANT.setting.ourTopStore, element: <OurTopStore /> },
  { name: "setting", path: ROUTE_CONSTANT.setting.wholesale, element: <Wholesale /> },
  { name: "setting", path: ROUTE_CONSTANT.setting.affiliate, element: <Affiliate /> },
  { name: "setting", path: ROUTE_CONSTANT.setting.about, element: <About /> },
  { name: "setting", path: ROUTE_CONSTANT.setting.contactShop, element: <ContactShop /> },
  { name: "setting", path: ROUTE_CONSTANT.setting.contactUs, element: <ContactUs /> },
];
