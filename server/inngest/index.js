import { Inngest } from "inngest";
import User from "../models/user.js";

// Create Inngest client
export const inngest = new Inngest({
  id: "quickshow-app",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const email = email_addresses?.[0]?.email_address || "";
    const name = `${first_name || ""} ${last_name || ""}`.trim() || "QuickShow User";

    const userData = {
      _id: id,
      email,
      name,
      image: image_url || "",
    };

    await User.findOneAndUpdate({ _id: id }, userData, { upsert: true, new: true });
    return { success: true, userId: id };
  }
);

// Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
    return { success: true, userId: id };
  }
);

// Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const email = email_addresses?.[0]?.email_address || "";
    const name = `${first_name || ""} ${last_name || ""}`.trim() || "QuickShow User";

    const userData = {
      _id: id,
      email,
      name,
      image: image_url || "",
    };

    await User.findOneAndUpdate({ _id: id }, userData, { upsert: true, new: true });
    return { success: true, userId: id };
  }
);

// Export all functions
export const syncUserFunctions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
];