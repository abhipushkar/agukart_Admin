import { ROUTE_CONSTANT } from "../../constant/routeContanst";
import AddAttributes from "./add_attribute";
import AttributesList from "./attribute_list";
import AttributeGroups from "./attribute_groups";

export const attributeRoutes = [
    { name: "attributes", path: ROUTE_CONSTANT.catalog.attribute.list, element: <AttributesList /> },
    { name: "attributes", path: ROUTE_CONSTANT.catalog.attribute.add, element: <AddAttributes /> },
    { name: "attributes", path: ROUTE_CONSTANT.catalog.attribute.group, element: <AttributeGroups /> }
]
