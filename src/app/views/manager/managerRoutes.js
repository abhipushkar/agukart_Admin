import { authRoles } from 'app/auth/authRoles';
import ManagerList from './manager_list';
import AddManager from './add_manager';
import {ROUTE_CONSTANT} from "../../constant/routeContanst";

const managerRoutes = [
    {
        path: ROUTE_CONSTANT.manager.list,
        element: <ManagerList />,
        auth: authRoles.admin,
    },
    {
        path: ROUTE_CONSTANT.manager.add,
        element: <AddManager />,
        auth: authRoles.admin,
    },
];

export default managerRoutes;
