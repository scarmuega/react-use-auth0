import React, { useEffect } from "react";
import * as ReactDOM from "react-dom";
import { Auth0Setup, useAuth0, useAuth0Token, useAuth0User } from "../index";


function PrivateData() {
    const user = useAuth0User();
    const token = useAuth0Token();
    return (
        <div>
            {user.result && <span>your user is: {JSON.stringify(user.result)}</span>}
            {token.result && <button onClick={() => console.log(token.result)}>log token</button>}
        </div>
    );
}

function LogoutButton() {
    const auth = useAuth0();
    return <button onClick={() => auth.logout()}>Logout</button>
}

function LoginButton() {
    const auth = useAuth0();
    return <button onClick={() => auth.loginWithRedirect({ appState: { button: "button_1" } })}>Login</button>
}

function App() {
    const auth = useAuth0();
    return (
        <>
            {auth.isAuthenticated && <PrivateData />}
            {!auth.isAuthenticated ? <LoginButton /> : <LogoutButton />}
        </>
    );
}

// A function that routes the user to the right place
// after login
const onRedirectCallback = (appState: any) => {
    window.history.replaceState({}, document.title, window.location.pathname);
    const button = appState && appState.button;
    console.log(`logged in from button: ${button}`);
};

ReactDOM.render(
    <Auth0Setup
        domain="my-tenant.auth0.com"
        clientId="client-id-provided-by-auth0"
        redirectUri="http://localhost:3001"
        onRedirectCallback={onRedirectCallback}
        scope="openid"
    >
        <App />
    </Auth0Setup>,
    document.getElementById("root")
);
