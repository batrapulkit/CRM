import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, '../../debug.log');

function logToFile(msg) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] [AUTH] ${msg}\n`);
}

// =========================
// REGISTER
// =========================
export const register = async (req, res) => {
  try {
    const { full_name, email, password, agency_name } = req.body;
    logToFile(`[Register Attempt] Email: ${email}, Agency: ${agency_name}`);

    if (!full_name || !email || !password || !agency_name) {
      logToFile("[Register Failed] Missing fields");
      return res.status(400).json({ error: "All fields required" });
    }

    // 1. Create Supabase Auth User
    logToFile("[Register] Creating Supabase Auth user...");
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (authError) {
      logToFile(`[Register Failed] Supabase Auth error: ${authError.message}`);
      throw authError;
    }
    const userId = authData.user.id;
    logToFile(`[Register] Auth user created. ID: ${userId}`);

    // 2. Create agency
    logToFile("[Register] Creating agency...");
    const { data: agency, error: agencyError } = await supabase
      .from("agencies")
      .insert({
        agency_name,
        contact_email: email,
        subscription_plan: 'free',
        subscription_status: 'active',
        max_users: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (agencyError) {
      logToFile(`[Register Failed] Agency creation error: ${agencyError.message}`);
      // Cleanup auth user if agency creation fails
      await supabase.auth.admin.deleteUser(userId);
      throw agencyError;
    }
    logToFile(`[Register] Agency created. ID: ${agency.id}`);

    // Hash password for local storage
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create user in our "users" table linked to Auth ID
    logToFile("[Register] Creating user in 'users' table...");
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        id: userId, // Link to Supabase Auth ID
        agency_id: agency.id,
        email,
        name: full_name,
        password_hash: passwordHash, // Store hashed password
        role: "admin",
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      logToFile(`[Register Failed] User table insertion error: ${userError.message}`);
      await supabase.auth.admin.deleteUser(userId);
      // Also delete agency if user creation fails to keep DB clean
      await supabase.from("agencies").delete().eq("id", agency.id);
      throw userError;
    }
    logToFile("[Register] User created in 'users' table");

    // Generate JWT for immediate login
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.name,
        agency_id: newUser.agency_id,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    logToFile("[Register Success] Token generated");

    return res.json({
      success: true,
      message: "Registration successful",
      token, // Return token
      user: newUser,
      agency,
    });
  } catch (err) {
    logToFile(`Register error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

// =========================
// LOGIN
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    logToFile(`[Login Attempt] Email: ${email}`);

    // 1. Try to find user in our "users" table
    let { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // 2. If user not found in "users" table, check if they exist in Supabase Auth
    if (error || !user) {
      logToFile("[Login] User not found in 'users' table. Checking Supabase Auth...");

      const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (sbError) {
        logToFile(`[Login Failed] Supabase Auth failed: ${sbError.message}`);
        return res.status(401).json({ error: "Invalid email or password" });
      }

      logToFile("[Login] Supabase Auth successful. Syncing user to 'users' table...");
      const sbUser = sbData.user;

      // Create agency (if needed)
      let agencyId = null;
      try {
        // Try to find existing agency with this email first
        const { data: existingAgency } = await supabase.from("agencies").select("id").eq("contact_email", email).single();

        if (existingAgency) {
          agencyId = existingAgency.id;
          logToFile(`[Login Sync] Found existing agency: ${agencyId}`);
        } else {
          // Create new agency
          const { data: agency, error: agencyError } = await supabase
            .from("agencies")
            .insert({
              agency_name: sbUser.user_metadata?.full_name ? `${sbUser.user_metadata.full_name}'s Agency` : "My Agency",
              contact_email: email,
              subscription_plan: 'free',
              subscription_status: 'active',
              max_users: 5,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (agencyError) {
            logToFile(`[Login Sync] Agency creation failed: ${agencyError.message}`);
            logToFile("[Login Sync] Proceeding without agency.");
          } else {
            agencyId = agency.id;
            logToFile(`[Login Sync] Agency created. ID: ${agencyId}`);
          }
        }
      } catch (err) {
        logToFile(`[Login Sync] Agency logic error: ${err.message}`);
      }

      // Create user in "users" table
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          id: sbUser.id,
          agency_id: agencyId, // Can be null
          email: sbUser.email,
          name: sbUser.user_metadata?.full_name || email.split('@')[0],
          password_hash: 'managed_by_supabase',
          role: "admin",
          status: "active",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        logToFile(`[Login Sync] User creation failed: ${createError.message}`);
        return res.status(500).json({ error: "Failed to sync user record" });
      }

      user = newUser;
      logToFile(`[Login Sync] User synced successfully. ID: ${user.id}`);
    } else {
      // User found in "users" table

      // --- SELF-HEALING: Fix missing agency_id for existing users ---
      if (!user.agency_id) {
        logToFile(`[Login] Existing user ${user.id} has no agency_id. Attempting to sync...`);
        let agencyId = null;
        try {
          // Try to find existing agency with this email first
          const { data: existingAgency } = await supabase.from("agencies").select("id").eq("contact_email", email).single();

          if (existingAgency) {
            agencyId = existingAgency.id;
            logToFile(`[Login Sync] Found existing agency: ${agencyId}`);
          } else {
            // Create new agency
            const { data: agency, error: agencyError } = await supabase
              .from("agencies")
              .insert({
                agency_name: user.name ? `${user.name}'s Agency` : "My Agency",
                contact_email: email,
                subscription_plan: 'free',
                subscription_status: 'active',
                max_users: 5,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (agencyError) {
              logToFile(`[Login Sync] Agency creation failed: ${agencyError.message}`);
            } else {
              agencyId = agency.id;
              logToFile(`[Login Sync] Agency created. ID: ${agencyId}`);
            }
          }

          if (agencyId) {
            // Update user
            const { error: updateError } = await supabase
              .from('users')
              .update({ agency_id: agencyId })
              .eq('id', user.id);

            if (updateError) {
              logToFile(`[Login Sync] Failed to update user agency_id: ${updateError.message}`);
            } else {
              user.agency_id = agencyId; // Update local object
              logToFile(`[Login Sync] User agency_id updated to ${agencyId}`);
            }
          }
        } catch (err) {
          logToFile(`[Login Sync] Agency logic error: ${err.message}`);
        }
      }
      // -----------------------------------------------------------

      let valid = false;

      // Check if password is managed by Supabase (legacy/hybrid) or local bcrypt
      if (user.password_hash === 'managed_by_supabase') {
        logToFile("[Login] User has Supabase-managed password. Attempting Supabase Auth sign-in...");
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (sbError) {
          logToFile(`[Login Failed] Supabase Auth failed: ${sbError.message}`);
          valid = false;
        } else {
          logToFile("[Login] Supabase Auth successful");
          valid = true;
        }
      } else {
        // Compare passwords using bcrypt
        valid = await bcrypt.compare(password, user.password_hash);
        logToFile(`[Login] Bcrypt validation result: ${valid}`);
      }

      if (!valid) return res.status(401).json({ error: "Invalid password" });
    }

    // Fetch full agency data
    let agency = null;
    const finalAgencyId = user.agency_id || (typeof agencyId !== 'undefined' ? agencyId : null);

    if (finalAgencyId) {
      const { data: agencyData, error: agencyFetchError } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", finalAgencyId)
        .single();

      if (agencyFetchError) {
        logToFile(`[Login] Warning: Failed to fetch agency data: ${agencyFetchError.message}`);
      } else {
        agency = agencyData;
        logToFile(`[Login] Agency data fetched: ${agency.agency_name}`);
      }
    }

    // Sign JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.name,
        agency_id: finalAgencyId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    logToFile("[Login Success] Token generated");

    return res.json({
      success: true,
      token,
      user,
      agency, // Include full agency data
    });
  } catch (err) {
    logToFile(`Login error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
};

// =========================
// CURRENT USER
// =========================
export const getCurrentUser = async (req, res) => {
  try {
    const { id } = req.user;

    const { data: user } = await supabase
      .from("users")
      .select("*, agencies(*)")
      .eq("id", id)
      .single();

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};

// =========================
// LOGOUT (client-side)
// =========================
export const logout = async (req, res) => {
  return res.json({ success: true, message: "Logged out" });
};

// =========================
// FORGOT PASSWORD
// =========================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    logToFile(`[Forgot Password] Request for: ${email}`);

    // Send password reset email using Supabase Auth
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
    });

    if (error) {
      logToFile(`[Forgot Password] Error: ${error.message}`);
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: "If an account exists with this email, you will receive password reset instructions."
      });
    }

    logToFile(`[Forgot Password] Reset email sent to: ${email}`);

    return res.json({
      success: true,
      message: "Password reset instructions have been sent to your email."
    });
  } catch (err) {
    logToFile(`Forgot password error: ${err.message}`);
    return res.status(500).json({ error: "Failed to process request" });
  }
};

// =========================
// RESET PASSWORD
// =========================
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    logToFile(`[Reset Password] Attempting password reset`);

    // Verify the reset token and update password in Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      logToFile(`[Reset Password] Error: ${error.message}`);
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    // Also update the users table password_hash to sync
    const userId = data.user.id;
    const newHash = await bcrypt.hash(newPassword, 10);

    await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId);

    logToFile(`[Reset Password] Success for user: ${userId}`);

    return res.json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password."
    });
  } catch (err) {
    logToFile(`Reset password error: ${err.message}`);
    return res.status(500).json({ error: "Failed to reset password" });
  }
};

