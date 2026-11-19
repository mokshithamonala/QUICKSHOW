import React, { createContext, useContext } from "react";
import {
  ClerkProvider,
  SignInButton as ClerkSignInButton,
  UserButton as ClerkUserButton,
  useUser as useClerkUser,
  useAuth as useClerkAuth,
} from "@clerk/react";
import toast from "react-hot-toast";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const isClerkEnabled = Boolean(
  PUBLISHABLE_KEY &&
    typeof PUBLISHABLE_KEY === "string" &&
    PUBLISHABLE_KEY.trim().startsWith("pk_")
);

const FallbackAuthContext = createContext({
  isLoaded: true,
  isSignedIn: false,
  user: null,
  getToken: async () => null,
});

class ClerkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("ClerkProvider fallback activated:", err?.message || err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const AuthProvider = ({ children }) => {
  const fallbackTree = (
    <FallbackAuthContext.Provider
      value={{
        isLoaded: true,
        isSignedIn: false,
        user: null,
        getToken: async () => null,
      }}
    >
      {children}
    </FallbackAuthContext.Provider>
  );

  if (isClerkEnabled) {
    return (
      <ClerkErrorBoundary fallback={fallbackTree}>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
          {children}
        </ClerkProvider>
      </ClerkErrorBoundary>
    );
  }

  return fallbackTree;
};

export const useAuthUser = () => {
  if (isClerkEnabled) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkUser();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContext(FallbackAuthContext);
};

export const useAuthSession = () => {
  if (isClerkEnabled) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkAuth();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContext(FallbackAuthContext);
};

export const AuthSignInButton = ({ children, ...props }) => {
  if (isClerkEnabled) {
    return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>;
  }

  return (
    <span
      onClick={() =>
        toast.error(
          "Clerk is not configured yet. Add VITE_CLERK_PUBLISHABLE_KEY to your .env file to enable Sign In."
        )
      }
    >
      {children}
    </span>
  );
};

export const AuthUserButton = (props) => {
  if (isClerkEnabled) {
    return <ClerkUserButton {...props} />;
  }
  return null;
};
