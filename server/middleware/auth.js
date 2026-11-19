import { getAuth, clerkClient } from "@clerk/express";
import { getUserById, upsertUser } from "../services/dataStore.js";

const clerkUserCache = new Map();
const CLERK_CACHE_TTL = 2 * 60 * 1000;

export const isClerkServerConfigured = () =>
  Boolean(
    process.env.CLERK_SECRET_KEY &&
      (process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY)
  );

const getConfiguredAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

const fetchClerkUserProfile = async (userId) => {
  const cached = clerkUserCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  if (!isClerkServerConfigured()) return null;

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const primaryEmail =
      clerkUser.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      "";
    const name =
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      clerkUser.username ||
      primaryEmail.split("@")[0] ||
      "QuickShow User";

    const profile = {
      userId,
      name,
      email: primaryEmail,
      image: clerkUser.imageUrl || "",
      publicMetadataRole: clerkUser.publicMetadata?.role || "",
    };

    clerkUserCache.set(userId, {
      data: profile,
      expiresAt: Date.now() + CLERK_CACHE_TTL,
    });
    return profile;
  } catch (err) {
    console.warn("⚠️ Could not fetch Clerk user profile:", err.message);
    return null;
  }
};

export const extractAuthUserId = (req) => {
  try {
    if (isClerkServerConfigured()) {
      const auth = getAuth(req);
      if (auth?.userId) return auth.userId;
    }
    if (typeof req.auth === "function") {
      return req.auth()?.userId || null;
    }
    return req.auth?.userId || null;
  } catch {
    return null;
  }
};

export const resolveAuthUser = async (req) => {
  const userId = extractAuthUserId(req);
  if (!userId) return null;

  const clerkProfile = await fetchClerkUserProfile(userId);
  const adminEmails = getConfiguredAdminEmails();
  const dbUser = await getUserById(userId);

  const email = (clerkProfile?.email || dbUser?.email || "").toLowerCase();
  const isAdminByMetadata =
    String(clerkProfile?.publicMetadataRole || "").toLowerCase() === "admin";
  const isAdminByEmail = Boolean(email && adminEmails.includes(email));
  const isAdminByDb = dbUser?.role === "admin";
  const isAdmin = isAdminByMetadata || isAdminByEmail || isAdminByDb;

  const synced = await upsertUser({
    _id: userId,
    name: clerkProfile?.name || dbUser?.name || "QuickShow User",
    email: clerkProfile?.email || dbUser?.email || "",
    image: clerkProfile?.image || dbUser?.image || "",
    role: isAdmin ? "admin" : dbUser?.role || "user",
  });

  return {
    userId,
    name: synced?.name || clerkProfile?.name || "QuickShow User",
    email: synced?.email || clerkProfile?.email || "",
    image: synced?.image || clerkProfile?.image || "",
    isAdmin,
    role: isAdmin ? "admin" : "user",
  };
};

export const requireAuth = async (req, res, next) => {
  try {
    const authUser = await resolveAuthUser(req);
    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in to continue.",
      });
    }
    req.authUser = authUser;
    return next();
  } catch (err) {
    return next(err);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const authUser = await resolveAuthUser(req);
    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }
    if (!authUser.isAdmin) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Administrator role is required. Signing in alone does not grant admin permissions.",
      });
    }
    req.authUser = authUser;
    return next();
  } catch (err) {
    return next(err);
  }
};
