import { ROUTE_CONSTANT } from "./constant/routeContanst";

export const vendorNavigations = [
    { name: "Dashboard", path: ROUTE_CONSTANT.dashboard, icon: "dashboard" },
    {
        name: "Message",
        icon: "message",
        path: ROUTE_CONSTANT.messageRoute.inbox
    },
    {
        name: "Shipping",
        icon: "group_add",
        children: [
            { name: "Shipping Settings", iconText: "CT", path: ROUTE_CONSTANT.Shipping.ShippingSettings.list },
        ]
    },
    {
        name: "Orders",
        icon: "group",
        path: ROUTE_CONSTANT.orders.orderPage
    },
    {
        name: "Product",
        iconText: "product",
        path: ROUTE_CONSTANT.catalog.product.list
    },
    {
        name: "Catalog",
        icon: "book",
        children: [
            { name: "Category", iconText: "CT", path: ROUTE_CONSTANT.catalog.category.list },
            { name: "Admin Category", iconText: "CT", path: ROUTE_CONSTANT.catalog.adminCategory.list },

            {
                name: "Brand",
                iconText: "book",
                path: ROUTE_CONSTANT.brand.list
            },
            {
                name: "Variant",
                iconText: "book",
                path: ROUTE_CONSTANT.catalog.variant.list
            },
            {
                name: "Occasions",
                iconText: "event",
                path: ROUTE_CONSTANT.catalog.occasions.list
            },
            {
                name: "Coupons",
                iconText: "event",
                path: ROUTE_CONSTANT.catalog.coupon.list
            },
            {
                name: "Promotional Offer",
                iconText: "event",
                path: ROUTE_CONSTANT.catalog.promotionalOffer.list
            }
        ]
    },
    {
        name: "Store Settings",
        icon: "message",
        path: ROUTE_CONSTANT.storeSetting.list
    },
    {
        name: "Policy Settings",
        icon: "message",
        path: ROUTE_CONSTANT.policySetting.list
    },
    {
        name: "Profile",
        icon: "person",
        children: [
            { name: "Edit Profile", iconText: "EP", path: ROUTE_CONSTANT.vendor.editVendorProfile },
            { name: "Banner Images", iconText: "BI", path: ROUTE_CONSTANT.vendorBannerImage.list },
        ]
    },
    {
        name: "Business Reports",
        icon: "settings",
        children: [
            {
                name: "Sales And Traffic Report",
                iconText: "CT",
                path: ROUTE_CONSTANT.businessReport.salesAndTrafficReport
            },
            { name: "Shop Sales Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.shopSalesReport },
            {
                name: "Sales By Child Item",
                iconText: "CT",
                path: ROUTE_CONSTANT.businessReport.salesAndTrafficByChildItem
            },
            {
                name: "Sales By Parent Item",
                iconText: "CT",
                path: ROUTE_CONSTANT.businessReport.salesAndTrafficByParentItem
            },
            { name: "New User Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.newUserReport },
            { name: "Customer Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.customerReport },
            { name: "Gift Card Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.giftCardReport },
        ]
    },
    {
        name: "Reviews",
        icon: "message",
        path: ROUTE_CONSTANT.reviews
    },
    { name: "Logout", icon: "logout" },
]

export const managerNavigations = [
    { name: "Dashboard", path: ROUTE_CONSTANT.dashboard, icon: "dashboard" },

    {
        name: "Customers",
        icon: "group",
        path: ROUTE_CONSTANT.customers.list,
        // Manager can VIEW customers, but restricted actions handled in UI
    },
    {
        name: "Orders",
        icon: "group",
        path: ROUTE_CONSTANT.orders.orderPage,
        // Cancel / Refund hidden at button-level inside Order page
    },
    {
        name: "Affiliate Users",
        icon: "group_add",
        children: [
            { name: "Users", iconText: "CT", path: ROUTE_CONSTANT.affiliateUser.users.list },
            { name: "Monthly Reports", iconText: "CT", path: ROUTE_CONSTANT.affiliateUser.monthlyReports.list },
        ]
    },
    {
        name: "Shipping",
        icon: "group_add",
        children: [
            { name: "Shipping Settings", iconText: "CT", path: ROUTE_CONSTANT.Shipping.ShippingSettings.list },
        ]
    },
    {
        name: "Message",
        icon: "message",
        path: ROUTE_CONSTANT.message,
    },
    {
        name: "Vendor",
        icon: "group_add",
        children: [
            // Manager cannot create Vendor
            { name: "List", iconText: "CT", path: ROUTE_CONSTANT.vendor.list },
        ]
    },
    {
        name: "Slider",
        icon: "slideshow",
        path: ROUTE_CONSTANT.slider.list
    },
    {
        name: "Catalog",
        icon: "book",
        children: [
            { name: "Category", iconText: "CT", path: ROUTE_CONSTANT.catalog.category.list },
            { name: "Admin Category", iconText: "CT", path: ROUTE_CONSTANT.catalog.adminCategory.list },
            { name: "Brand", iconText: "book", path: ROUTE_CONSTANT.brand.list },
            { name: "Variant", iconText: "book", path: ROUTE_CONSTANT.catalog.variant.list },
            { name: "Product", iconText: "product", path: ROUTE_CONSTANT.catalog.product.list },
            { name: "Occasions", iconText: "event", path: ROUTE_CONSTANT.catalog.occasions.list },
        ]
    },
    {
        name: "Gift Card",
        icon: "gift",
        children: [
            { name: "Category", iconText: "CT", path: ROUTE_CONSTANT.giftCard.category.list },
            { name: "Gift", iconText: "CT", path: ROUTE_CONSTANT.giftCard.gift.list },
            { name: "Banner List", iconText: "CT", path: ROUTE_CONSTANT.giftCard.bannerList.list },
            { name: "Description", iconText: "CT", path: ROUTE_CONSTANT.giftCard.description },
            { name: "Purchaes History", iconText: "CT", path: ROUTE_CONSTANT.giftCard.purchaesHistory },
            // Manager cannot add balance (button-level restriction inside UI)
        ]
    },
    {
        name: "Blog",
        icon: "article",
        children: [
            { name: "Add Tag", iconText: "CT", path: ROUTE_CONSTANT.tag.add },
            { name: "View Tag", iconText: "product", path: ROUTE_CONSTANT.tag.list },
            { name: "Add Blog", iconText: "book", path: ROUTE_CONSTANT.blog.add },
            { name: "View Blog", iconText: "book", path: ROUTE_CONSTANT.blog.list },
        ]
    },
    {
        name: "Voucher",
        icon: "settings",
        path: ROUTE_CONSTANT.voucher.list
    },
    {
        name: "Business Reports",
        icon: "settings",
        children: [
            { name: "Sales And Traffic Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.salesAndTrafficReport },
            { name: "Shop Sales Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.shopSalesReport },
            { name: "Sales By Child Item", iconText: "CT", path: ROUTE_CONSTANT.businessReport.salesAndTrafficByChildItem },
            { name: "Sales By Parent Item", iconText: "CT", path: ROUTE_CONSTANT.businessReport.salesAndTrafficByParentItem },
            { name: "New User Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.newUserReport },
            { name: "Customer Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.customerReport },
            { name: "Gift Card Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.giftCardReport },
        ]
    },
    {
        name: "Report",
        icon: "settings",
        children: [
            { name: "Shop Report", iconText: "CT", path: ROUTE_CONSTANT.report.shopReport },
            { name: "Product Report", iconText: "CT", path: ROUTE_CONSTANT.report.productReport },
        ]
    },
    {
        name: "Reviews",
        icon: "message",
        path: ROUTE_CONSTANT.reviews
    },
    {
        name: "Subscribe Emails",
        icon: "information",
        path: ROUTE_CONSTANT.subscribeEmail
    },
    {
        name: "Information",
        icon: "information",
        children: [
            { name: "Privacy Policy", iconText: "CT", path: ROUTE_CONSTANT.information.privacyPolicy },
            { name: "Terms & Condition", iconText: "CT", path: ROUTE_CONSTANT.information.termsCondition },
        ]
    },
    { name: "Logout", icon: "logout" }
];

export const navigations = [
    { name: "Dashboard", path: ROUTE_CONSTANT.dashboard, icon: "dashboard" },

    // { label: "PAGES", type: "label" },
    // {
    //   name: "Session/Auth",
    //   icon: "security",
    //   children: [
    //     { name: "Sign in", iconText: "SI", path: "/login" },
    //     { name: "Sign up", iconText: "SU", path: "/session/signup" },
    //     { name: "Forgot Password", iconText: "FP", path: "/session/forgot-password" },
    //     { name: "Error", iconText: "404", path: "/session/404" }
    //   ]
    // },


    // {
    //   name: "Product",
    //   icon: "shoppingcart",
    //   path: ROUTE_CONSTANT.catalog.product.list
    // },

    {
        name: "Customers",
        icon: "group",
        path: ROUTE_CONSTANT.customers.list
    },
    {
        name: "Orders",
        icon: "group",
        path: ROUTE_CONSTANT.orders.orderPage
    },
    {
        name: "Affiliate Users",
        icon: "group_add",
        children: [
            { name: "Users", iconText: "CT", path: ROUTE_CONSTANT.affiliateUser.users.list },
            { name: "Monthly Reports", iconText: "CT", path: ROUTE_CONSTANT.affiliateUser.monthlyReports.list },
        ]
    },
    {
        name: "Shipping",
        icon: "group_add",
        children: [
            { name: "Shipping Settings", iconText: "CT", path: ROUTE_CONSTANT.Shipping.ShippingSettings.list },
        ]
    },
    {
        name: "Message",
        icon: "message",
        path: ROUTE_CONSTANT.message,
    },
    {
        name: "Vendor",
        icon: "group_add",
        children: [
            { name: "Add", iconText: "CT", path: ROUTE_CONSTANT.vendor.add },
            { name: "List", iconText: "CT", path: ROUTE_CONSTANT.vendor.list },
        ]
    },
    {
        name: "Manager",
        icon: "group_add",
        children: [
            { name: "Add", iconText: "CT", path: ROUTE_CONSTANT.manager.add },
            { name: "List", iconText: "CT", path: ROUTE_CONSTANT.manager.list },
        ]
    },
    {
        name: "Slider",
        icon: "slideshow",
        path: ROUTE_CONSTANT.slider.list
    },
    {
        name: "Product",
        iconText: "product",
        path: ROUTE_CONSTANT.catalog.product.list
    },
    {
        name: "Catalog",
        icon: "book",
        children: [
            { name: "Category", iconText: "CT", path: ROUTE_CONSTANT.catalog.category.list },
            { name: "Admin Category", iconText: "CT", path: ROUTE_CONSTANT.catalog.adminCategory.list },
            {
                name: "Brand",
                iconText: "book",
                path: ROUTE_CONSTANT.brand.list
            },
            {
                name: "Variant",
                iconText: "book",
                path: ROUTE_CONSTANT.catalog.variant.list
            },
            {
                name: "Attributes",
                iconText: "event",
                path: ROUTE_CONSTANT.catalog.attribute.list,
            },
            {
                name: "Occasions",
                iconText: "event",
                path: ROUTE_CONSTANT.catalog.occasions.list
            }
        ]
    },
    {
        name: "Gift Card",
        icon: "gift",
        children: [
            { name: "Category", iconText: "CT", path: ROUTE_CONSTANT.giftCard.category.list },
            { name: "Gift", iconText: "CT", path: ROUTE_CONSTANT.giftCard.gift.list },
            { name: "Banner List", iconText: "CT", path: ROUTE_CONSTANT.giftCard.bannerList.list },
            { name: "Description", iconText: "CT", path: ROUTE_CONSTANT.giftCard.description },
            { name: "Purchaes History", iconText: "CT", path: ROUTE_CONSTANT.giftCard.purchaesHistory },
        ]
    },
    {
        name: "Blog",
        icon: "article",
        children: [
            { name: "Add Tag", iconText: "CT", path: ROUTE_CONSTANT.tag.add },
            {
                name: "View Tag",
                iconText: "product",
                path: ROUTE_CONSTANT.tag.list
            },
            {
                name: "Add Blog",
                iconText: "book",
                path: ROUTE_CONSTANT.blog.add
            },
            {
                name: "View Blog",
                iconText: "book",
                path: ROUTE_CONSTANT.blog.list
            }
        ]
    },
    {
        name: "Voucher",
        icon: "settings",
        path: ROUTE_CONSTANT.voucher.list
    },
    {
        name: "Business Reports",
        icon: "settings",
        children: [
            {
                name: "Sales And Traffic Report",
                iconText: "CT",
                path: ROUTE_CONSTANT.businessReport.salesAndTrafficReport
            },
            { name: "Shop Sales Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.shopSalesReport },
            {
                name: "Sales By Child Item",
                iconText: "CT",
                path: ROUTE_CONSTANT.businessReport.salesAndTrafficByChildItem
            },
            {
                name: "Sales By Parent Item",
                iconText: "CT",
                path: ROUTE_CONSTANT.businessReport.salesAndTrafficByParentItem
            },
            { name: "New User Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.newUserReport },
            { name: "Customer Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.customerReport },
            { name: "Gift Card Report", iconText: "CT", path: ROUTE_CONSTANT.businessReport.giftCardReport },
        ]
    },
    {
        name: "Report",
        icon: "settings",
        children: [
            { name: "Shop Report", iconText: "CT", path: ROUTE_CONSTANT.report.shopReport },
            { name: "Product Report", iconText: "CT", path: ROUTE_CONSTANT.report.productReport },
        ]
    },
    {
        name: "Reviews",
        icon: "message",
        path: ROUTE_CONSTANT.reviews
    },
    {
        name: "Subscribe Emails",
        icon: "information",
        path: ROUTE_CONSTANT.subscribeEmail
    },
    {
        name: "Setting",
        icon: "settings",
        children: [
            { name: "Homepage", iconText: "CT", path: ROUTE_CONSTANT.setting.homepage },
            { name: "Country Access Settings", iconText: "CT", path: ROUTE_CONSTANT.setting.countryAccessSettings },
            { name: "About", iconText: "CT", path: ROUTE_CONSTANT.setting.about },
            { name: "Affiliate", iconText: "CT", path: ROUTE_CONSTANT.setting.affiliate },
            { name: "Contact Shop", iconText: "CT", path: ROUTE_CONSTANT.setting.contactShop },
            { name: "Contact Us", iconText: "CT", path: ROUTE_CONSTANT.setting.contactUs },
            { name: "Our Top Brands", iconText: "CT", path: ROUTE_CONSTANT.setting.ourTopBrands },
            { name: "Our Top Store", iconText: "CT", path: ROUTE_CONSTANT.setting.ourTopStore },
            { name: "Wholesale", iconText: "CT", path: ROUTE_CONSTANT.setting.wholesale },
        ]
    },
    {
        name: "Information",
        icon: "information",
        children: [
            { name: "Privacy Policy", iconText: "CT", path: ROUTE_CONSTANT.information.privacyPolicy },
            { name: "Terms & Condition", iconText: "CT", path: ROUTE_CONSTANT.information.termsCondition },
        ]
    },
    // {
    //   name: "Blog",
    //   icon: "article",
    //   path: ROUTE_CONSTANT.blog.list
    // },
    { name: "Logout", icon: "logout" }

    // { label: "Components", type: "label" },
    // {
    //   name: "Components",
    //   icon: "favorite",
    //   badge: { value: "30+", color: "secondary" },
    //   children: [
    //     { name: "Auto Complete", path: "/material/autocomplete", iconText: "A" },
    //     { name: "Buttons", path: "/material/buttons", iconText: "B" },
    //     { name: "Checkbox", path: "/material/checkbox", iconText: "C" },
    //     { name: "Dialog", path: "/material/dialog", iconText: "D" },
    //     { name: "Expansion Panel", path: "/material/expansion-panel", iconText: "E" },
    //     { name: "Form", path: "/material/form", iconText: "F" },
    //     { name: "Icons", path: "/material/icons", iconText: "I" },
    //     { name: "Menu", path: "/material/menu", iconText: "M" },
    //     { name: "Progress", path: "/material/progress", iconText: "P" },
    //     { name: "Radio", path: "/material/radio", iconText: "R" },
    //     { name: "Switch", path: "/material/switch", iconText: "S" },
    //     { name: "Slider", path: "/material/slider", iconText: "S" },
    //     { name: "Snackbar", path: "/material/snackbar", iconText: "S" },
    //     { name: "Table", path: "/material/table", iconText: "T" }
    //   ]
    // },
    // {
    //   name: "Charts",
    //   icon: "trending_up",
    //   children: [{ name: "Echarts", path: "/charts/echarts", iconText: "E" }]
    // },
    // {
    //   name: "Documentation",
    //   icon: "launch",
    //   type: "extLink",
    //   path: "http://demos.ui-lib.com/matx-react-doc/"
    // }
];
