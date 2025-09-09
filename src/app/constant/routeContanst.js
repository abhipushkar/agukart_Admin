import ShopReport from "app/views/Report/ShopReport";
import Wholesale from "app/views/setting/Wholesale";

export const ROUTE_CONSTANT = {
  login: "/login",
  dashboard: "/dashboard",
  customers: {
    list: "/pages/customer-list",
    view: "/pages/view-customer"
  },
  slider: {
    list: "/pages/slider-list",
    add: "/pages/add-slider"
  },
  voucher: {
    list: "/pages/voucher-list",
    add: "/pages/add-voucher"
  },
  account: "/account",
  catalog: {
    category: {
      list: "/catalog/category/list",
      add: "/catalog/category/addcategory"
    },
    adminCategory: {
      list: "/catalog/admin-category/list",
      add: "/catalog/admin-category/add-admin-category"
    },
    variant: {
      list: "/catalog/variant-list",
      add: "/catalog/add-variant"
    },
    product: {
      list: "/catalog/product-list",
      add: "/catalog/add-product/",
      parentProducts: "/catalog/add-parent-products"
    },
    occasions: {
      list: "/catalog/occasions-list"
    },
    coupon:{
      list: "/catalog/coupon-list",
      add: "/catalog/add-coupon"
    },
    promotionalOffer:{
      list: "/catalog/promotional-offer-list",
      add: "/catalog/add-promotional-offer"
    }
  },
  storeSetting: {
    list: "/store-setting-list",
    add: "/store-setting-add"
  },
  policySetting: {
    list: "/policy-setting-list",
    add: "/policy-setting-add"
  },
  affiliateUser: {
    users:{
      list: "/affiliate-user/users/list",
      edit: "/affiliate-user/users/edit"
    },
    monthlyReports:{
      list: "/affiliate-user/monthly-reports/list",
      affiliateUsers: "/affiliate-user/monthly-reports/affiliate-list"
    }
  },
  Shipping: {
    ShippingSettings:{
      list: "/shipping/shipping-settings/list",
      edit: "/shipping/shipping-settings/edit"
    }
  },
  giftCard: {
    category: {
      list: "/gift-card/category/list",
      add: "/gift-card/category/add"
    },
    gift: {
      list: "/gift-card/gift/list",
      add: "/gift-card/gift/add"
    },
    bannerList:{
      list:"/gift-card/banner-list"
    },
    description:"/gift-card/description",
    purchaesHistory:"/gift-card/purchaes-history"
  },
  giftCardPurchaesHistory: {
    list:"/gift-card-purchaes-history/list"
  },
  brand: {
    list: "/catalog/brand/list",
    add: "/catalog/brand/add"
  },
  blog: {
    list: "/pages/blog/list",
    add: "/pages/blog/add"
  },
  tag: {
    list: "/pages/tag/list",
    add: "/pages/tag/add"
  },
  resetPass: "/reset-password",
  pageExpired: "/page-expired",
  setting: {
    homepage: "/pages/homepage",
    countryAccessSettings:"/pages/country-access-settings",
    ourTopBrands:"/pages/our-top-brands",
    ourTopStore:"/pages/our-top-store",
    wholesale:"/pages/wholesale",
    affiliate:"/pages/affiliate",
    about:"/pages/about",
    contactShop:"/pages/contact-shop",  
    contactUs:"/pages/contact-us"
  },
  report: {
    shopReport: "/report/shop-report",
    productReport: "/report/product-report",
    viewShopReport: "/report/view-shop-report",
    viewProductReport: "/report/view-product-report"
  },
  information: {
    privacyPolicy: "/pages/privacy-policy",
    termsCondition: "/pages/terms-&-condition"
  },
  vendor: {
    list: "/pages/list",
    add: "/pages/add"
  },
  orders: {
    orderPage: "/pages/orders",
    orderHistory: "/pages/order-history",
    orderSlip: "/pages/order-slip"
  },

  messageRoute: {
    fromEtsy: "/pages/message/etsy",
    compose: "/pages/message/compose",
    composeMessage: "/pages/message/compose/message",
    inbox: "/pages/message/inbox",
    sent: "/pages/message/sent",
    unread: "/pages/message/unread",
    pin: "/pages/message/pin",
    trash: "/pages/message/trash"
  },
  message: "/pages/message",
  reviews: "/pages/reviews",
  businessReport: {
    salesAndTrafficReport:"/business-report/sales-and-traffic-report",
    shopSalesReport:"/business-report/shop-sales-report",
    salesAndTrafficByChildItem:"/business-report/sales-and-traffic-by-child-item",
    salesAndTrafficByParentItem:"/business-report/sales-and-traffic-by-parent-item",
    newUserReport:"/business-report/new-user-report",
    customerReport:"/business-report/customer-report",
    giftCardReport:"/business-report/gift-card-report"
  },
  subscribeEmail:"/pages/subscribe-email"
};
