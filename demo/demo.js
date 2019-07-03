"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var ReactDOM = __importStar(require("react-dom"));
var index_1 = require("../index");
function PrivateData() {
    var auth = index_1.useAuth0();
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("span", null,
            "your id token is: ",
            auth.idToken),
        react_1.default.createElement("button", { onClick: auth.logout }, "logout")));
}
function LoginButton() {
    var auth = index_1.useAuth0();
    return react_1.default.createElement("button", { onClick: auth.login }, "login!");
}
function App() {
    var auth = index_1.useAuth0();
    return auth.isAuthenticated() ? react_1.default.createElement(PrivateData, null) : react_1.default.createElement(LoginButton, null);
}
ReactDOM.render(react_1.default.createElement(index_1.Auth0Setup, { domain: "my-tenant.auth0.com", clientID: "client-id-data-provided-by-auth0", redirectUri: "http://localhost:3001", responseType: "token id_token", scope: "openid", sessionStorage: true },
    react_1.default.createElement(App, null)), document.getElementById("root"));
