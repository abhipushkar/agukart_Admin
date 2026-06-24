// routeHelper.js

import { localStorageKey } from "./localStorageKey";

export const getDashboardRoute = () => {
    const designation_id = Number(
        localStorage.getItem(localStorageKey.designation_id)
    );

    return designation_id === 3
        ? "/store/dashboard"
        : "/dashboard";
};