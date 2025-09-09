import { lazy } from "react";
import Loadable from "app/components/Loadable";
import PageExpired from "./PageExpired";

const NotFound = Loadable(lazy(() => import("./NotFound")));
const ForgotPassword = Loadable(lazy(() => import("./ForgotPassword")));
const ResetPassword = Loadable(lazy(() => import("./ResetPassword")));

const Login = Loadable(lazy(() => import("./login/Login")));
// const FirebaseRegister = Loadable(lazy(() => import("./register/FirebaseRegister")));

// const JwtLogin = Loadable(lazy(() => import("./login/JwtLogin")));
// const JwtRegister = Loadable(lazy(() => import("./register/JwtRegister")));

// const Auth0Login = Loadable(lazy(() => import("./login/Auth0Login")));

const sessionRoutes = [
  // { path: "/session/signup", element: <FirebaseRegister /> },
  { path: "/login", element: <Login /> },
  { path: "/session/forgot-password/:token", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "*", element: <NotFound /> },
  { path: "/page-expired", element: <PageExpired /> }
];

export default sessionRoutes;
