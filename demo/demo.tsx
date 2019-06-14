import React from "react";
import * as ReactDOM from "react-dom";
import { Auth0Setup, useAuth0 } from "../index";

function PrivateData() {
    const auth = useAuth0();
    return (
        <div>
            <span>your id token is: {auth.idToken}</span>
            <button onClick={auth.logout}>logout</button>
        </div>
    );
}

function LoginButton() {
    const auth = useAuth0();
    return <button onClick={auth.login}>login!</button>
}

function App() {
    const auth = useAuth0();
    return auth.isAuthenticated() ? <PrivateData /> : <LoginButton />
}

ReactDOM.render(
    <Auth0Setup
        domain="my-tenant.auth0.com"
        clientID="client-id-data-provided-by-auth0"
        redirectUri="http://localhost:3001"
        responseType="token id_token"
        scope="openid"
    >
        <App />
    </Auth0Setup>,
    document.getElementById("root")
);
