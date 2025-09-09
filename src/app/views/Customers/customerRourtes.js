import { ROUTE_CONSTANT } from "app/constant/routeContanst";
import CustomersList from "./CustomersList";
import ViewCustomer from "./ViewCustomer";

export const customersRoutes = [
  { name: "customerlist", path: ROUTE_CONSTANT.customers.list, element: <CustomersList /> },
  { name: "viewcustomer", path: ROUTE_CONSTANT.customers.view, element: <ViewCustomer /> }
];
