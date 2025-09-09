import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { redirect } from "react-router-dom";
import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";
import Loadable from "./components/Loadable";
import MatxLayout from "./components/MatxLayout/MatxLayout";
import sessionRoutes from "./views/sessions/session-routes";
import materialRoutes from "app/views/material-kit/MaterialRoutes";
import { ROUTE_CONSTANT } from "./constant/routeContanst";
import { customersRoutes } from "./views/Customers/customerRourtes";
import { accountRoutes } from "./views/account/accountRoutes";
import { catalogRoutes } from "./views/Catalog/catalogRoutes";
import { BrandRoutes } from "./views/Brand/BrandRouts";
import { SliderRoutes } from "./views/Slider/SliderRoutes";
import { VariantRoutes } from "./views/variant/variantRoutes";
import { productsRoutes } from "./views/Product/productRoutes";
import { OccasionsRoutes } from "./views/Occasions/OccasionsRoutes";
import { element } from "prop-types";
import { blogRoutes } from "./views/blog/blogRoutes";
import { tagRoutes } from "./views/tag/tagRoute";
import { adminCategoryRoutes } from "./views/AdminCategory/adminCategoryRoutes";
import { settingRoutes } from "./views/setting/settingRoutes";
import { informationRoutes } from "./views/information/informationRoutes";
import { VendorRoutes } from "./views/vendor/VendorRoutes";
import { OrdersRoutes } from "./views/orders/OrdersRoutes";
import { MsgRoutes } from "./views/message/MsgRoutes";
import { ReviewsRoutes } from "./views/reviews/ReviewsRoutes";
import { VoucherRoutes } from "./views/Voucher/VoucherRoutes";
import { CouponRoutes } from "./views/coupon/CouponRoutes";
import { PromotionalOfferRoutes } from "./views/promotionalOffer/PromotionalOfferRoutes";
import { GiftCardCategoryRoutes }  from "./views/giftCardCategory/GiftCardCategoryRoutes";
import { GiftCardGiftRoutes } from "./views/giftCardGift/GiftCardGiftRoutes";
import { AffiliateRoutes } from "./views/affiliateUser/AffiliateRoutes";
import { ShippingSettingsRoutes } from "./views/shipping/ShippingSettingsRoutes";
import { MonthlyReportsRoutes } from "./views/monthlyReports/MonthlyReportsRoutes";
import { StoreSettingroutes } from "./views/StoreSettings/StoreSettingRoutes";
import { PolicySettingroutes } from "./views/PolicySettings/PolicySettingsRoutes";
import { businessReportRoutes } from "./views/BusinessReport/BusinessReportRoutes";
import { SubscribeEmailroutes } from "./views/SubscribeEmail/SubscribeEmailRoutes";
import { reportRoutes } from "./views/Report/reportRoutes";
// E-CHART PAGE
const AppEchart = Loadable(lazy(() => import("app/views/charts/echarts/AppEchart")));
// DASHBOARD PAGE
const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));

const routes = [
  {
    name: "login",
    path: "/",
    element: <Navigate to={ROUTE_CONSTANT.login} />
  },
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      ...materialRoutes,
      // dashboard route
      {
        name: "dashboard",
        path: ROUTE_CONSTANT.dashboard,
        element: <Analytics />,
        auth: authRoles.admin
      },
      // e-chart route
      // {
      //   path: "/charts/echarts",
      //   element: <AppEchart />,
      //   auth: authRoles.editor
      // },
      ...customersRoutes,
      ...accountRoutes,
      ...catalogRoutes,
      ...BrandRoutes,
      ...SliderRoutes,
      ...VoucherRoutes,
      ...VariantRoutes,
      ...productsRoutes,
      ...OccasionsRoutes,
      ...CouponRoutes,
      ...PromotionalOfferRoutes,
      ...blogRoutes,
      ...GiftCardCategoryRoutes,
      ...GiftCardGiftRoutes,
      ...tagRoutes,
      ...adminCategoryRoutes,
      ...settingRoutes,
      ...informationRoutes,
      ...VendorRoutes,
      ...OrdersRoutes,
      ...MsgRoutes,
      ...ReviewsRoutes,
      ...AffiliateRoutes,
      ...ShippingSettingsRoutes,
      ...MonthlyReportsRoutes,
      ...StoreSettingroutes,
      ...PolicySettingroutes,
      ...businessReportRoutes,
      ...SubscribeEmailroutes,
      ...reportRoutes
    ]
  },

  // session pages route
  ...sessionRoutes
];

export default routes;
