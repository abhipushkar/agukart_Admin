import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import AddProductNew from "../product_new/add_product/AddProductNew";
import ProductListNew from "../product_new/product_list/ProductListNew";
import ParentProducts from "./parentProducts/ParentProducts";

export const productsRoutes = [
  { name: "productlist", path: ROUTE_CONSTANT.catalog.product.list, element: <ProductListNew /> },
  { name: "productlist", path: ROUTE_CONSTANT.catalog.product.add, element: <AddProductNew /> },
  {
    name: "parentproductlist",
    path: ROUTE_CONSTANT.catalog.product.parentProducts,
    element: <ParentProducts />
  }
];
