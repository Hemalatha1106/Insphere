import { supabaseAdmin } from "../services/supabaseClient.js";

export const oauthCallback = async (req, res) => {
  try {
    const { user } = req.body;

    if (!user?.id) {
      return res.status(400).json({ message: "Invalid OAuth user" });
    }

    const authUserId = user.id;
    const email = user.email ?? null;
    const fullName = user.user_metadata?.full_name || "";

    // Check if user already exists using auth_user_id
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

    // Create user if not exists
    if (!existingUser) {
      const { error } = await supabaseAdmin.from("users").insert({
        auth_user_id: authUserId,
        email,
        name: fullName,
        user_type: "student",
        is_profile_complete: false
      });

      if (error) throw error;
    }

    return res.status(200).json({
      message: "OAuth success",
      is_profile_complete: existingUser?.is_profile_complete ?? false
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
