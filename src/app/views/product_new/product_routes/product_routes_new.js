import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import AddProductNew from "../add_product/AddProductNew";
import ProductListNew from "../product_list/ProductListNew";
import AddParentProductsNew from "../add_parent_product/AddParentProductsNew";

export const productsRoutesNew = [
    { name: "productList", path: ROUTE_CONSTANT.catalog.productNew.list, element: <ProductListNew /> },
    { name: "addProduct", path: ROUTE_CONSTANT.catalog.productNew.add, element: <AddProductNew /> },
    {
        name: "parentProductList",
        path: ROUTE_CONSTANT.catalog.productNew.parentProducts,
        element: <AddParentProductsNew />
    }
];

