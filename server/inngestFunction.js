import { inngest } from "./inngest/index.js";
import User from "../models/user.js";

// This function will run when a new Clerk user is created
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" }, // Unique ID for your function
  { event: "clerk/user.created" }, // Event from Clerk
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      // Construct user data
      const userData = {
        _id: id,
        name: `${first_name} ${last_name}`,
        email: email_addresses[0].email_address,
        image: image_url || "",
      };

      // Save to MongoDB (upsert)
      await User.findOneAndUpdate({ _id: id }, userData, { upsert: true });

      console.log("✅ New user synced:", userData);
      return { success: true };
    } catch (error) {
      console.error("❌ Error syncing user:", error);
      return { success: false, error: error.message };
    }
  }
);