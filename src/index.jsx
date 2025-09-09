import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// import "react-toastify/dist/ReactToastify.css";
import * as serviceWorker from "./serviceWorker";
import App from "./app/App";
import "react-quill/dist/quill.snow.css";
// third party style
import "perfect-scrollbar/css/perfect-scrollbar.css";
import "./index.css";
import { REACT_APP_BASE_URL } from "./config";
import { registerLicense } from '@syncfusion/ej2-base'

registerLicense("ORg4AjUWIQA/Gnt2VVhhQlFaclhJWHxMYVF2R2FJeFRycF9FaEwgOX1dQl9hSXpTcEVmWn9feHVRQWY=");

const root = createRoot(document.getElementById("root"));

// ecommercereact
// https://project.imgglobal.in/ecommercereact/

// # Enable mod_rewrite
// RewriteEngine On
// RewriteBase /ecommercereact/
// # Serve static files directly if exists
// RewriteCond %{REQUEST_FILENAME} !-f
// RewriteCond %{REQUEST_FILENAME} !-d
// RewriteRule ^(.*)$ /ecommercereact/index.html [QSA,L]

{
  /* <base href="/ecommercereact/"></base> */
}

root.render(
  <BrowserRouter basename={`${REACT_APP_BASE_URL}`}>
    <App />
  </BrowserRouter>
);

// for IE-11 support un-comment cssVars() and it's import in this file
// and in MatxTheme file

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
