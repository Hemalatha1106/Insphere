import { supabaseAdmin } from "../services/supabaseClient.js";

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
