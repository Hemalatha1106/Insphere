import { supabase } from "../services/supabaseClient.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to request
    req.user = data.user;

    next();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
