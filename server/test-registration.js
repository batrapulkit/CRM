const API_URL = 'http://127.0.0.1:5000/api/auth';

const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    full_name: 'Test User',
    agency_name: 'Test Agency'
};

async function testRegistration() {
    try {
        console.log('Registering user:', testUser.email);
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Registration successful!');
            console.log('User ID:', data.user.id);
            console.log('Agency ID:', data.agency.id);
            console.log('Agency Plan:', data.agency.subscription_plan);
            console.log('Agency Status:', data.agency.subscription_status);
        } else {
            console.error('❌ Registration failed:', data);
        }
    } catch (error) {
        console.error('❌ Registration error:', error.message);
    }
}

testRegistration();
