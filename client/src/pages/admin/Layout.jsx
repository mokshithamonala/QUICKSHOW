import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { ShieldAlert, Lock } from "lucide-react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Loading from "../../components/Loading";
import { useAuthSession, useAuthUser, AuthSignInButton } from "../../lib/auth";
import { apiRequest } from "../../lib/api";

const Layout = () => {
  const { user, isLoaded } = useAuthUser();
  const { getToken } = useAuthSession();
  const [authState, setAuthState] = useState("checking"); // checking | allowed | denied
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setAuthState("unauthenticated");
      return;
    }

    let active = true;
    setAuthState("checking");
    apiRequest("/api/admin/me", { getToken })
      .then((res) => {
        if (!active) return;
        if (res?.isAdmin) {
          setAdminUser(res.user);
          setAuthState("allowed");
        } else {
          setAuthState("denied");
        }
      })
      .catch(() => {
        if (active) setAuthState("denied");
      });

    return () => {
      active = false;
    };
  }, [user, isLoaded, getToken]);

  if (!isLoaded || authState === "checking") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <Lock className="w-14 h-14 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Admin Sign In Required</h1>
        <p className="text-gray-400 max-w-md mb-6 text-sm">
          Sign in with an authorized administrator Clerk account to manage QuickShow theaters, shows, and bookings.
        </p>
        <div className="flex gap-3">
          <AuthSignInButton mode="modal">
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold cursor-pointer">
              Sign In
            </button>
          </AuthSignInButton>
          <Link
            to="/"
            className="px-6 py-3 bg-zinc-900 border border-white/15 hover:bg-zinc-800 rounded-lg font-semibold"
          >
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (authState === "denied") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied — Admin Role Required</h1>
        <p className="text-gray-400 max-w-lg mb-6 text-sm leading-relaxed">
          Your account is signed in, but it does not have QuickShow administrator privileges.
          Admin access is verified on the backend via Clerk <code className="text-red-400">publicMetadata.role = &quot;admin&quot;</code> or the <code className="text-red-400">ADMIN_EMAILS</code> environment setting.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
        >
          Return to QuickShow
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar adminUser={adminUser} />
        <div className="flex-1 px-4 py-8 md:px-10 h-[calc(100vh-64px)] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;