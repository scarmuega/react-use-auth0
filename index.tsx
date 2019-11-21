import React, { useState, useEffect, useContext, PropsWithChildren, useRef } from "react";
import createAuth0Client from "@auth0/auth0-spa-js";
import Auth0Client from "@auth0/auth0-spa-js/dist/typings/Auth0Client";

const DEFAULT_REDIRECT_CALLBACK = () => window.history.replaceState({}, document.title, window.location.pathname);

export interface Auth0Renders {
    isAuthenticated: boolean;
    user: any | null;
    loading: boolean;
    popupOpen: boolean;
    loginWithPopup: (options?: PopupLoginOptions) => void;
    getTokenSilently: (options?: GetTokenSilentlyOptions) => Promise<string>;
    logout: (options?: LogoutOptions) => void;
}

const Auth0Context = React.createContext<Auth0Renders>({
    isAuthenticated: false,
    user: null,
    loading: false,
    popupOpen: false,
    loginWithPopup: () => { throw Error("not initialized"); },
    getTokenSilently: () => { throw Error("not initialized"); },
    logout: () => { throw Error("not initialized"); },
});

export const useAuth0 = () => useContext(Auth0Context);

export interface Auth0ProviderProps {
    domain: string;
    clientId: string;
    redirectUri: string;
    scope?: string;
    audience?: string;
    issuer?: string;
    onRedirectCallback: (appState: any) => void;
}

interface ProviderState {
    isInitialized: boolean;
    isAuthenticated: boolean;
    loading: boolean;
    popupOpen: boolean;
    user: any;
}

type ClientRef = React.MutableRefObject<Auth0Client | undefined>;
type ChangeProviderState = (prevState: ProviderState) => ProviderState;
type SetProviderState = (change: ChangeProviderState) => void;

async function initializeClient(props: Auth0ProviderProps, clientRef: ClientRef, setState: SetProviderState) {
    const client = await createAuth0Client({
        domain: props.domain,
        client_id: props.clientId,
        redirect_uri: props.redirectUri,
        audience: props.audience,
        scope: props.scope,
        issuer: props.issuer,
    });

    clientRef.current = client;

    if (window.location.search.includes("code=")) {
        const { appState } = await client.handleRedirectCallback();
        props.onRedirectCallback(appState);
    }

    const isAuthenticated = await client.isAuthenticated();
    const user = isAuthenticated ? await client.getUser() : null;
    setState(prevState => ({...prevState, isInitialized: true, isAuthenticated, user }));
}

function unwrapClientRef(clientRef: ClientRef): Auth0Client {
    if (!clientRef.current) {
        throw new Error("auth0 client has not been initialized");
    }

    return clientRef.current;
}

async function loginWithPopup(clientRef: ClientRef, setState: SetProviderState, options?: PopupLoginOptions) {
    const client = unwrapClientRef(clientRef);

    setState(prev => ({...prev, popupOpen: true }));

    try {
        await client.loginWithPopup(options);
    } catch (error) {
        console.error(error);
        setState(prev => ({...prev, isAuthenticated: false, user: null, popupOpen: false }));
    }

    const user = await client.getUser();
    setState(prev => ({...prev, user, isAuthenticated: true, popupOpen: false }));
};

async function getTokenSilently(clientRef: ClientRef, options?: GetTokenSilentlyOptions) {
    const client = unwrapClientRef(clientRef);
    return await client.getTokenSilently(options);
}

async function logout(clientRef: ClientRef, setState: SetProviderState, options?: LogoutOptions) {
    const client = unwrapClientRef(clientRef);
    client.logout(options);
    setState(prev => ({...prev, user: null, isAuthenticated: false }));
};

const INITIAL_STATE = { isInitialized: false, isAuthenticated: false, user: null, popupOpen: false, loading: false }

export const Auth0Setup = (props: PropsWithChildren<Auth0ProviderProps>) => {
    const [state, setState] = useState<ProviderState>(INITIAL_STATE);
    const auth0Client = useRef<Auth0Client>();

    useEffect(() => {
        initializeClient(props, auth0Client, setState);
    }, []);

    return (
        <Auth0Context.Provider
            value={{
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                loading: state.loading,
                popupOpen: state.popupOpen,
                loginWithPopup: (options?: PopupLoginOptions) => loginWithPopup(auth0Client, setState, options),
                getTokenSilently: (options?: GetTokenSilentlyOptions) => getTokenSilently(auth0Client, options),
                logout: (options?: LogoutOptions) => logout(auth0Client, setState, options),
            }}
        >
            {props.children}
        </Auth0Context.Provider>
    );
};