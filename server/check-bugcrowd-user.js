import { supabase } from './src/config/supabase.js';
import bcrypt from 'bcryptjs';

async function checkAndFixBugcrowdUser() {
    const email = 'bugcrowd1103@gmail.com';

    console.log('=== Checking user:', email, '===\n');

    // 1. Check if user exists
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.log('❌ User not found in users table');
        console.log('Error:', userError?.message || 'No error');

        // Check Supabase Auth
        console.log('\n Checking Supabase Auth...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        const authUser = authUsers?.users?.find(u => u.email === email);

        if (authUser) {
            console.log('✅ User found in Supabase Auth');
            console.log('User ID:', authUser.id);
            console.log('Email verified:', authUser.email_confirmed_at ? 'Yes' : 'No');
            console.log('\n⚠️  User exists in Auth but not in users table - needs sync');
        } else {
            console.log('❌ User not found in Supabase Auth either');
        }
        return;
    }

    console.log('✅ User found!');
    console.log('User ID:', user.id);
    console.log('Name:', user.name);
    console.log('Agency ID:', user.agency_id);
    console.log('Password hash type:', user.password_hash === 'managed_by_supabase' ? 'Supabase Auth' : 'Bcrypt');
    console.log('Role:', user.role);
    console.log('Status:', user.status);

    // 2. Test password
    const testPassword = 'Bugcrowd2001';
    console.log('\n=== Testing password "' + testPassword + '" ===');

    if (user.password_hash === 'managed_by_supabase') {
        console.log('Password managed by Supabase Auth - testing...');
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: testPassword
        });

        if (error) {
            console.log('❌ Supabase Auth password test failed:', error.message);
            console.log('\n💡 Solution: Reset password in Supabase Auth dashboard');
        } else {
            console.log('✅ Password is correct in Supabase Auth!');
        }
    } else {
        // Bcrypt password
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        console.log('Bcrypt validation result:', isValid);

        if (!isValid) {
            console.log('❌ Password does not match');
            console.log('\n🔧 Fixing password...');

            const newHash = await bcrypt.hash(testPassword, 10);
            const { error: updateError } = await supabase
                .from('users')
                .update({ password_hash: newHash })
                .eq('id', user.id);

            if (updateError) {
                console.log('❌ Failed to update password:', updateError.message);
            } else {
                console.log('✅ Password updated successfully!');
                console.log('You can now login with:', email, '/', testPassword);
            }
        } else {
            console.log('✅ Password is correct!');
        }
    }

    // 3. Check agency
    if (user.agency_id) {
        const { data: agency, error: agencyError } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', user.agency_id)
            .single();

        if (agency) {
            console.log('\n=== Agency Info ===');
            console.log('Agency Name:', agency.agency_name);
            console.log('Agency ID:', agency.id);
        } else {
            console.log('\n⚠️  Agency not found for ID:', user.agency_id);
        }
    } else {
        console.log('\n⚠️  User has no agency assigned');
    }
}

checkAndFixBugcrowdUser()
    .then(() => {
        console.log('\n✅ Check complete');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
