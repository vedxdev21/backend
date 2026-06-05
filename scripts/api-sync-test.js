/**
 * API_SYNC_TEST.js
 * Test all backend API endpoints and validate responses
 * Run: node scripts/api-sync-test.js
 */

const axios = require('axios');
const chalk = require('chalk');

const API_BASE = 'http://localhost:5000/api/v1';

// Test data
let testToken = null;
let testUserId = null;
let testPropertyId = null;

const tests = [];
let passed = 0;
let failed = 0;

// Helper to test endpoint
async function testEndpoint(method, endpoint, description, data = null, requireAuth = true) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: requireAuth && testToken ? { 'Authorization': `Bearer ${testToken}` } : {},
      data,
    };

    const response = await axios(config);
    
    if (response.data.success) {
      console.log(chalk.green(`✓ ${method} ${endpoint}`), `- ${description}`);
      passed++;
      return response.data.data;
    } else {
      console.log(chalk.red(`✗ ${method} ${endpoint}`), `- ${description}`, response.data.message);
      failed++;
      return null;
    }
  } catch (err) {
    console.log(chalk.red(`✗ ${method} ${endpoint}`), `- ${description}`, err.message);
    failed++;
    return null;
  }
}

async function runTests() {
  console.log(chalk.blue.bold('\n🧪 ProjectX API Sync Tests\n'));
  
  // 1. Health Check
  console.log(chalk.cyan('1. Health Check'));
  await testEndpoint('GET', '/health', 'Server health', null, false);

  // 2. Auth Tests
  console.log(chalk.cyan('\n2. Authentication'));
  
  // Register or Login
  const loginRes = await testEndpoint('POST', '/auth/login/email', 'Login with email', {
    email: 'test@example.com',
    password: 'test123456'
  }, false);
  
  if (loginRes?.accessToken) {
    testToken = loginRes.accessToken;
    testUserId = loginRes.user?.id;
    console.log(chalk.yellow(`   Token: ${testToken.substring(0, 20)}...`));
  }

  // 3. User Tests
  if (testToken) {
    console.log(chalk.cyan('\n3. User Endpoints'));
    
    const profile = await testEndpoint('GET', '/user/profile', 'Get profile');
    if (profile?.id) testUserId = profile.id;

    await testEndpoint('GET', '/user/stats', 'Get user stats');
    await testEndpoint('GET', '/location/cities', 'Get all cities', null, false);
    await testEndpoint('GET', '/location/areas/Bhopal', 'Get areas', null, false);

    // 4. Property Tests
    console.log(chalk.cyan('\n4. Property Endpoints'));
    
    const properties = await testEndpoint('GET', '/property/browse?city=Bhopal&limit=5', 'Browse properties');
    if (properties?.[0]?.id) testPropertyId = properties[0].id;

    if (testPropertyId) {
      await testEndpoint('GET', `/property/${testPropertyId}`, 'Get property details');
      await testEndpoint('POST', `/property/${testPropertyId}/save`, 'Save property');
    }

    await testEndpoint('GET', '/property/my-listings', 'Get my listings');
    await testEndpoint('GET', '/property/saved', 'Get saved properties');

    // 5. Roommate Tests
    console.log(chalk.cyan('\n5. Roommate Endpoints'));
    
    const roommates = await testEndpoint('GET', '/roommate/browse', 'Browse roommate profiles');
    if (roommates?.[0]?.id) {
      await testEndpoint('GET', `/roommate/${roommates[0].id}`, 'Get roommate profile');
    }

    // 6. Mess Tests
    console.log(chalk.cyan('\n6. Mess Endpoints'));
    
    const mess = await testEndpoint('GET', '/mess/browse', 'Browse mess');
    if (mess?.[0]?.id) {
      await testEndpoint('GET', `/mess/${mess[0].id}`, 'Get mess details');
    }

    // 7. Cook Tests
    console.log(chalk.cyan('\n7. Cook Endpoints'));
    
    const cooks = await testEndpoint('GET', '/cook/browse', 'Browse cooks');
    if (cooks?.[0]?.id) {
      await testEndpoint('GET', `/cook/${cooks[0].id}`, 'Get cook details');
    }

    // 8. Chat Tests
    console.log(chalk.cyan('\n8. Chat Endpoints'));
    
    await testEndpoint('GET', '/chat/conversations', 'Get conversations');

    // 9. Notification Tests
    console.log(chalk.cyan('\n9. Notification Endpoints'));
    
    await testEndpoint('GET', '/notification/all', 'Get notifications');

    // 10. Admin Tests (if admin)
    console.log(chalk.cyan('\n10. Admin Endpoints'));
    
    await testEndpoint('GET', '/admin/stats', 'Get admin stats');
    await testEndpoint('GET', '/admin/users?page=1&limit=10', 'Get users (admin)');
  }

  // Summary
  console.log(chalk.blue.bold(`\n📊 Test Summary`));
  console.log(chalk.green(`✓ Passed: ${passed}`));
  console.log(chalk.red(`✗ Failed: ${failed}`));
  console.log(chalk.yellow(`Total: ${passed + failed}`));
  console.log();
}

runTests().catch(console.error);
