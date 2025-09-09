import ProductList from "./ProductList";
import AddProduct from "./AddProduct";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import ParentProducts from "./parentProducts/ParentProducts";

export const productsRoutes = [
  { name: "productlist", path: ROUTE_CONSTANT.catalog.product.list, element: <ProductList /> },
  { name: "productlist", path: ROUTE_CONSTANT.catalog.product.add, element: <AddProduct /> },
  {
    name: "parentproductlist",
    path: ROUTE_CONSTANT.catalog.product.parentProducts,
    element: <ParentProducts />
  }
];
