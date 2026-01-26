import { supabase } from "../services/supabaseClient.js";

export const setupProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const data = req.body;

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
    await supabase.from("profiles").upsert({
      user_id: userId,
      ...data
    });

    // mark profile complete
    await supabase
      .from("users")
      .update({ is_profile_complete: true })
      .eq("id", userId);

    res.json({ message: "Profile setup completed" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
