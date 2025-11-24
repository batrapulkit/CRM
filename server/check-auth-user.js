import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const email = "bugcrowd1103@gmail.com";

async function checkUser() {
    const result = {};
    console.log(`Checking user: ${email}`);

    // Check Supabase Auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        result.authError = error.message;
    } else {
        const user = users.find(u => u.email === email);
        if (user) {
            result.auth = { status: "FOUND", id: user.id };
        } else {
            result.auth = { status: "NOT_FOUND" };
        }
    }

    // Check 'users' table
    const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (dbUser) {
        result.db = {
            status: "FOUND",
            id: dbUser.id,
            password_hash: dbUser.password_hash
        };
    } else {
        result.db = { status: "NOT_FOUND" };
        if (dbError) result.dbError = dbError.message;
    }

    fs.writeFileSync('result.json', JSON.stringify(result, null, 2));
    console.log("Done writing result.json");
}

checkUser();
