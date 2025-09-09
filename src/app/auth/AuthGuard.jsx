import { Navigate, useLocation } from "react-router-dom";
import { localStorageKey } from "app/constant/localStorageKey";
import { ROUTE_CONSTANT } from "app/constant/routeContanst";
// HOOK
// import useAuth from "app/hooks/useAuth";

export default function AuthGuard({ children }) {
  const isAuthenticated = localStorage.getItem(localStorageKey.auth_key);
  // const isAuthenticated = true;

  const { pathname } = useLocation();
  if (isAuthenticated) return <>{children}</>;

  return <Navigate replace to={ROUTE_CONSTANT.login} state={{ from: pathname }} />;
}
