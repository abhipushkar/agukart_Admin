import ProductList from "./ProductList";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ParentProducts from "./parentProducts/ParentProducts";
import AddProductNew from "../product_new/add_product/AddProductNew";

export const productsRoutes = [
  { name: "productlist", path: ROUTE_CONSTANT.catalog.product.list, element: <ProductList /> },
  { name: "productlist", path: ROUTE_CONSTANT.catalog.product.add, element: <AddProductNew /> },
  {
    name: "parentproductlist",
    path: ROUTE_CONSTANT.catalog.product.parentProducts,
    element: <ParentProducts />
  }
];
