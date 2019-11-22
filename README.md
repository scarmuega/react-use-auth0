useAuth0
========

This library hides all the boilerplate code required to authenticate a React SPA using Auth0. Most of the code is borrowed from the [official Auth0 tutorial](https://auth0.com/docs/quickstart/spa/react/01-login), but also adds some nice-to-have utilities for common use-cases.

Installation
------------

to install the library, do as usual:

```
npm install --save react-use-auth0
```

Usage
-----

As the name implies, it uses react hooks. Here's a snippet of how to use the `useAuth0` and the `Auth0Setup` HoC that provides the context for the children:

```tsx
import React from "react";
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
```

Demo 
-----
You can find a very basic example in the `/demo` folder. To run it, first change your tenant and client id inside `demo.tsx` and then start the server by running `npm run start`