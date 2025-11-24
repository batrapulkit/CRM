import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const email = "bugcrowd1103@gmail.com";
const newPassword = "password123";

async function switchToLocalAuth() {
    console.log(`Switching user ${email} to local authentication...`);

    // 1. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log("Password hashed.");

    // 2. Update the user record in 'users' table
    const { data, error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('email', email)
        .select();

    if (error) {
        console.error("❌ Error updating user:", error.message);
    } else {
        console.log("✅ User updated successfully!");
        console.log("User ID:", data[0].id);
        console.log("New Hash:", data[0].password_hash.substring(0, 20) + "...");
    }
}

switchToLocalAuth();
