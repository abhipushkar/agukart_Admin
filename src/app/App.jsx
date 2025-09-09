import { useRoutes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { MatxTheme } from "./components";
import { ToastContainer } from "react-toastify";
import { localStorageKey } from "./constant/localStorageKey";
import SettingsProvider from "./contexts/SettingsContext";
import routes from "./routes";
import "../fake-db";
import ProfileContextProvider from "./contexts/profileContext";
import NotFound from "./views/sessions/NotFound";
import { ChatProvider } from "./contexts/ChatContextAdmin";

export default function App() {
  const designation_id = +localStorage.getItem(localStorageKey.designation_id);

  const filteredRoutes = routes[1].children?.filter((route) => {
    return ![
      "customerlist",
      "slider",
      "category",
      "brand",
      "variant",
      "viewcustomer",
      "OccasionsList",
      "vendor",
      "information",
      "setting",
      "adminCategory",
      "blog"
    ].includes(route.name);
  });

  const finalRoutes =
    designation_id === 3
      ? [{ ...routes[1], children: [...filteredRoutes, { path: "*", element: <NotFound /> }] }]
      : [...routes, { path: "*", element: <NotFound /> }];

  const content = useRoutes(finalRoutes);

  return (
    <ProfileContextProvider>
      <ChatProvider>
        <SettingsProvider>
          <MatxTheme>
            <CssBaseline />
            {content}
            <ToastContainer />
          </MatxTheme>
        </SettingsProvider>
      </ChatProvider>
    </ProfileContextProvider>
  );
}
