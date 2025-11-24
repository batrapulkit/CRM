import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const userId = "597e1979-41c8-4936-90b5-1f96caa91300";
const newPassword = "password123";

async function resetPassword() {
    console.log(`Resetting password for user ID: ${userId}`);

    const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
    );

    if (error) {
        console.error("❌ Error resetting password:", error.message);
    } else {
        console.log("✅ Password reset successful!");
        console.log("User:", data.user.email);
    }
}

resetPassword();
