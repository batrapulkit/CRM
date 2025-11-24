import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Testing Supabase Connection...");
console.log("URL:", process.env.SUPABASE_URL ? "Set" : "Missing");
console.log("Key:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing environment variables!");
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
            console.error("❌ Connection failed:", error.message);
        } else {
            console.log("✅ Connection successful!");
            console.log("User count (approx):", data);
        }

        // Also try to list one user to be sure
        const { data: users, error: userError } = await supabase.from('users').select('email').limit(1);
        if (userError) {
            console.error("❌ Failed to fetch users:", userError.message);
        } else {
            console.log("✅ Fetched users successfully. Count:", users.length);
        }

    } catch (err) {
        console.error("❌ Unexpected error:", err);
    }
}

testConnection();
