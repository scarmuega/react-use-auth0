import React, { useState, useEffect, useRef, useContext, PropsWithChildren } from 'react';
import auth0 from 'auth0-js';

export interface UseAuth0ContextValue {
    login: () => void;
    logout: () => void;
    renew: () => void;
    isAuthenticated: () => boolean;
    accessToken: string | null;
    idToken: string | null;
}

export interface Auth0ProviderProps {
  domain: string;
  clientID: string;
  redirectUri: string;
  responseType: string;
  scope: string;
}

type OnAuthChangeCallback = (result: auth0.Auth0DecodedHash | null) => void;

type MaybeDecodedHash = auth0.Auth0DecodedHash | null | undefined;

const UninitializedAuthValue: UseAuth0ContextValue = {
  login: () => console.warn("setup required"),
  logout: () => console.warn("setup required"),
  renew: () => console.warn("setup required"),
  isAuthenticated: () => false,
  accessToken: null,
  idToken: null,
};

const UseAuth0Context = React.createContext<UseAuth0ContextValue>(UninitializedAuthValue);

function trySetAuthResultFromHash(webAuth: auth0.WebAuth, onResult: OnAuthChangeCallback) {
  console.log("trying to parse hash");
  webAuth.parseHash((err, authResult) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      onResult(authResult);
    } else if (err) {
      console.log(err);
      onResult(null);
    }
  });
}

function executLogout(webAuth: auth0.WebAuth, onAuthChange: OnAuthChangeCallback) {
  webAuth.logout({ returnTo: window.location.origin });
  onAuthChange(null);
}

function buildContextValueFromAuthResult(webAuth: auth0.WebAuth, result: MaybeDecodedHash, onAuthChange: OnAuthChangeCallback): UseAuth0ContextValue {
  return {
    login: () => webAuth.authorize(),
    logout: () => executLogout(webAuth, onAuthChange),
    renew: () => console.log("renew"),
    isAuthenticated: () => (!!result && !!result.accessToken && !!result.idToken),
    accessToken: result && result.accessToken || null,
    idToken: result && result.idToken || null,
  }
}

export function Auth0Setup(props: PropsWithChildren<Auth0ProviderProps>) {
  const webAuth = useRef(new auth0.WebAuth({...props}));

  const [authResult, setAuthResult] = useState<MaybeDecodedHash>(null);

  useEffect(() => trySetAuthResultFromHash(webAuth.current, setAuthResult), []);

  const output = buildContextValueFromAuthResult(webAuth.current, authResult, setAuthResult);

  return <UseAuth0Context.Provider value={output}>{props.children}</UseAuth0Context.Provider>
}

export function useAuth0() {
  return useContext(UseAuth0Context);
}
