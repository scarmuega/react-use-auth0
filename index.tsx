import React, { useState, useEffect, useContext, PropsWithChildren, useRef } from "react";
import createAuth0Client, { PopupLoginOptions, RedirectLoginOptions, LogoutOptions, GetUserOptions, GetTokenSilentlyOptions } from "@auth0/auth0-spa-js";
import { useAsync } from 'react-async-hook';
import Auth0Client from "@auth0/auth0-spa-js/dist/typings/Auth0Client";

const DEFAULT_REDIRECT_CALLBACK = () => window.history.replaceState({}, document.title, window.location.pathname);

export interface Auth0Renders {
    clientRef: ClientRef | null;
    isAuthenticated: boolean;
    loading: boolean;
    popupOpen: boolean;
    loginWithPopup: (options?: PopupLoginOptions) => void;
    loginWithRedirect: (options?: RedirectLoginOptions) => void;
    logout: (options?: LogoutOptions) => void;
}

const Auth0Context = React.createContext<Auth0Renders>({
    clientRef: null,
    isAuthenticated: false,
    loading: false,
    popupOpen: false,
    loginWithPopup: () => { throw Error("not initialized"); },
    loginWithRedirect: () => { throw Error("not initialized"); },
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
    onRedirectCallback?: (appState: any) => void;
}

interface ProviderState {
    isInitialized: boolean;
    isAuthenticated: boolean;
    loading: boolean;
    popupOpen: boolean;
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
        props.onRedirectCallback && props.onRedirectCallback(appState);
    }

    const isAuthenticated = await client.isAuthenticated();

    setState(prevState => ({...prevState, isInitialized: true, isAuthenticated }));
}

function unwrapClientRef(clientRef: ClientRef | null): Auth0Client {
    if (!clientRef || !clientRef.current) {
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
        setState(prev => ({...prev, isAuthenticated: false, popupOpen: false }));
    }

    const user = await client.getUser();
    setState(prev => ({...prev, isAuthenticated: true, popupOpen: false }));
};

async function loginWithRedirect(clientRef: ClientRef, setState: SetProviderState, options?: RedirectLoginOptions) {
    const client = unwrapClientRef(clientRef);

    try {
        await client.loginWithRedirect(options);
    } catch (error) {
        console.error(error);
        setState(prev => ({...prev, isAuthenticated: false, user: null }));
    }
};

async function logout(clientRef: ClientRef, setState: SetProviderState, options?: LogoutOptions) {
    const client = unwrapClientRef(clientRef);
    client.logout(options);
    setState(prev => ({...prev, user: null, isAuthenticated: false }));
};

const INITIAL_STATE = { isInitialized: false, isAuthenticated: false, user: null, popupOpen: false, loading: false }

export const Auth0Setup = (props: PropsWithChildren<Auth0ProviderProps>) => {
    const [state, setState] = useState<ProviderState>(INITIAL_STATE);
    const clientRef = useRef<Auth0Client>();

    useEffect(() => {
        initializeClient(props, clientRef, setState);
    }, []);

    return (
        <Auth0Context.Provider
            value={{
                clientRef,
                isAuthenticated: state.isAuthenticated,
                loading: state.loading,
                popupOpen: state.popupOpen,
                loginWithPopup: (options?: PopupLoginOptions) => loginWithPopup(clientRef, setState, options),
                loginWithRedirect: (options?: RedirectLoginOptions) => loginWithRedirect(clientRef, setState, options),
                logout: (options?: LogoutOptions) => logout(clientRef, setState, options),
            }}
        >
            {state.isInitialized ? props.children : null}
        </Auth0Context.Provider>
    );
};

export function useAuth0User(options?: GetUserOptions) {
    const auth0 = useAuth0();
    const client = unwrapClientRef(auth0.clientRef);
    return useAsync(async () => client.getUser(options), []);
}

export function useAuth0Token(options?: GetTokenSilentlyOptions) {
    const auth0 = useAuth0();
    const client = unwrapClientRef(auth0.clientRef);
    return useAsync(async () => client.getTokenSilently(options), []);
}