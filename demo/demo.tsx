import React, { useEffect } from "react";
import * as ReactDOM from "react-dom";
import { Auth0Setup, useAuth0 } from "../index";

function PrivateData() {
    const auth = useAuth0();
    return (
        <div>
            <span>your id token is: {JSON.stringify(auth.user)}</span>
            <button onClick={() => auth.getTokenSilently().then(token => console.log(token)) }>get token</button>
            <button onClick={() => auth.logout()}>logout</button>
        </div>
    );
}

function LoginButton() {
    const auth = useAuth0();
    return <button onClick={() => auth.loginWithPopup()}>login</button>
}

function App() {
    const auth = useAuth0();
    return auth.isAuthenticated ? <PrivateData /> : <LoginButton />
}

// A function that routes the user to the right place
// after login
const onRedirectCallback = (appState: any) => {
    window.location.pathname = "/"
};

ReactDOM.render(
    <Auth0Setup
        domain="my-tenant.auth0.com"
        clientId="my-auth0-provided-id"
        redirectUri="http://localhost:3001"
        onRedirectCallback={onRedirectCallback}
        scope="openid"
    >
        <App />
    </Auth0Setup>,
    document.getElementById("root")
);
