// const fetch = require('node-fetch'); // Using built-in fetch

const API_URL = 'http://localhost:5000/api/auth';

const testUser = {
    email: `test_login_${Date.now()}@example.com`,
    password: 'password123',
    full_name: 'Test Login User',
    agency_name: 'Test Login Agency'
};

async function testLoginFlow() {
    console.log(`\n--- Starting Login Flow Test ---`);
    console.log(`Target: ${API_URL}`);
    console.log(`User: ${testUser.email}`);

    try {
        // 1. Register
        console.log(`\n1. Registering user...`);
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const regData = await regRes.json();

        if (!regRes.ok) {
            console.error('❌ Registration failed:', regData);
            return;
        }
        console.log('✅ Registration successful');
        console.log('User ID:', regData.user?.id);

        // 2. Login
        console.log(`\n2. Logging in...`);
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.error('❌ Login failed:', loginData);
            console.log('Status:', loginRes.status);
        } else {
            console.log('✅ Login successful');
            console.log('Token received:', !!loginData.token);
            console.log('User ID:', loginData.user?.id);
            console.log('Agency ID:', loginData.user?.agency_id);
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testLoginFlow();
