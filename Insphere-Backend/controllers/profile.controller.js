import { supabaseAdmin } from "../services/supabaseClient.js";
import refreshUserStats from "../services/aggregator.service.js";

export const setupProfile = async (req, res) => {
  try {
    const authUserId = req.user.id; // from auth middleware
    const data = req.body;
    console.log("Auth User ID:", authUserId);
    console.log("Request data:", data);

    // Get or create user in users table
    let { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (userError || !user) {
      // Create user if not exists
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          auth_user_id: authUserId,
          email: req.user.email || null,
          name: req.user.user_metadata?.full_name || "",
          user_type: "student",
          is_profile_complete: false
        })
        .select("id")
        .single();

      if (createError) {
        console.log("Create user error:", createError);
        return res.status(500).json({ error: createError.message });
      }

      user = newUser;
    }

    const userId = user.id;
    console.log("User ID from DB:", userId);

    // basic validation
    if (!data.full_name || !data.profile_type || !data.linkedin_url) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // conditional validation
    if (data.profile_type === "student") {
      if (!data.college_name || !data.degree || !data.cgpa) {
        return res.status(400).json({ message: "Student details incomplete" });
      }
    }

    if (data.profile_type === "professional") {
      if (!data.company_name || !data.designation || !data.experience_years) {
        return res.status(400).json({ message: "Professional details incomplete" });
      }
    }

    // upsert profile
    const profileResult = await supabaseAdmin.from("profiles").upsert({
      user_id: userId,
      ...data
    });
    console.log("Profile upsert result:", profileResult);

    // mark profile complete
    const userUpdateResult = await supabaseAdmin
      .from("users")
      .update({ is_profile_complete: true })
      .eq("id", userId);
    console.log("User update result:", userUpdateResult);

    res.json({ message: "Profile setup completed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const authUserId = req.user.id;
    // 1. ADD GFG AND HACKERRANK HERE
    const { 
      github_username, 
      leetcode_username, 
      codeforces_username, 
      geeksforgeeks_username, 
      hackerrank_username 
    } = req.body;

    // Get user from users table
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;

    // Fetch existing profile
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingProfile) {
      // 2. ADD THEM TO THE UPDATE OBJECT HERE
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({
          github_username: github_username || existingProfile.github_username,
          leetcode_username: leetcode_username || existingProfile.leetcode_username,
          codeforces_username: codeforces_username || existingProfile.codeforces_username,
          geeksforgeeks_username: geeksforgeeks_username || existingProfile.geeksforgeeks_username,
          hackerrank_username: hackerrank_username || existingProfile.hackerrank_username,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (profileError) {
        return res.status(500).json({ error: profileError.message });
      }

      res.json({ message: "Profile usernames updated successfully", profile });
    } else {
      return res.status(400).json({ 
        error: "Profile does not exist. Please use POST /api/profile/setup first."
      });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const syncProfile = async (req, res) => {
  try {
    const authUserId = req.user.id;

    // Get user from users table
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;

    // Trigger sync via aggregator service
    const result = await refreshUserStats(userId);

    if (!result.success) {
      return res.status(500).json({ error: "Failed to sync profile", details: result.error });
    }

    res.json({ message: "Profile synced successfully", data: result.data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const authUserId = req.user.id;

    // Get user from users table
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;

    // Get profile data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get platform stats
    const { data: stats, error: statsError } = await supabaseAdmin
      .from("platform_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    res.json({
      profile: profile || null,
      stats: stats || null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
