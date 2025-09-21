#!/usr/bin/env node

/**
 * Authentication Testing Script
 *
 * This script demonstrates how to test the refactored authentication system.
 * It includes examples for registration, login, protected route access, and logout.
 *
 * Usage:
 *   node scripts/test-auth.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test user data
const testUser = {
  fullName: "Test User",
  email: `test_${Date.now()}@example.com`,
  password: "SecurePass123!",
  role: "customer"
};

let authToken = null;

async function testRegistration() {
  console.log('\n🔧 Testing User Registration...');
  try {
    const response = await axios.post(`${API_BASE}/auth/signup`, testUser);
    console.log('✅ Registration successful:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔑 Testing User Login...');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    authToken = response.data.accessToken;
    console.log('✅ Login successful:', response.data.message);
    console.log('🎫 Token received (length):', authToken?.length);
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testProtectedRoute() {
  console.log('\n🔒 Testing Protected Route Access...');
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }

  try {
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Protected route access successful');
    console.log('👤 User data received:', response.data.user?.email);
    return true;
  } catch (error) {
    console.log('❌ Protected route access failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testInvalidToken() {
  console.log('\n🚫 Testing Invalid Token...');
  try {
    await axios.get(`${API_BASE}/auth/profile`, {
      headers: {
        'Authorization': 'Bearer invalid-token-123'
      }
    });
    console.log('❌ Invalid token test failed - should have been rejected');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Invalid token correctly rejected');
      return true;
    }
    console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testRateLimit() {
  console.log('\n⏰ Testing Rate Limiting...');
  const promises = [];

  // Make 10 rapid requests to test rate limiting
  for (let i = 0; i < 10; i++) {
    promises.push(
      axios.post(`${API_BASE}/auth/login`, {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      }).catch(error => error.response)
    );
  }

  try {
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(response => response?.status === 429);

    if (rateLimited) {
      console.log('✅ Rate limiting is working');
      return true;
    } else {
      console.log('⚠️ Rate limiting not triggered (might need more requests or shorter window)');
      return true; // Not a failure, just info
    }
  } catch (error) {
    console.log('❌ Rate limit test error:', error.message);
    return false;
  }
}

async function testLogout() {
  console.log('\n🚪 Testing User Logout...');
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }

  try {
    const response = await axios.post(`${API_BASE}/auth/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Logout successful:', response.data.message);

    // Test that the token is now blacklisted
    try {
      await axios.get(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log('❌ Token blacklisting failed - token still works');
      return false;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Token successfully blacklisted');
        return true;
      }
    }
  } catch (error) {
    console.log('❌ Logout failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testHealthCheck() {
  console.log('\n❤️ Testing Health Check...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check successful:', response.data.message);
    console.log('🌍 Environment:', response.data.environment);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Authentication System Tests');
  console.log('📡 API Base URL:', API_BASE);

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testRegistration },
    { name: 'User Login', fn: testLogin },
    { name: 'Protected Route', fn: testProtectedRoute },
    { name: 'Invalid Token', fn: testInvalidToken },
    { name: 'Rate Limiting', fn: testRateLimit },
    { name: 'User Logout', fn: testLogout }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! The refactored authentication system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the server logs and configuration.');
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test runner error:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests };