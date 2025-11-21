// Test script for authentication system
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

// Helper function to log with color
const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Test data
const studentData = {
  email: `student.test.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  role: 'student',
  firstName: 'Test',
  lastName: 'Student'
};

const organizationData = {
  email: `org.test.${Date.now()}@example.com`,
  password: 'TestPassword123!',
  role: 'organization',
  companyName: 'Test Company Inc.'
};

async function testStudentRegistration() {
  log.info('Testing Student Registration...');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, studentData);

    if (response.data.success) {
      log.success('Student registered successfully!');
      log.info(`Student ID: ${response.data.data.user._id}`);
      log.info(`Profile ID: ${response.data.data.profile._id}`);
      log.info(`Email: ${studentData.email}`);
      return response.data.data.tokens.accessToken;
    }
  } catch (error) {
    log.error(`Student registration failed: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testOrganizationRegistration() {
  log.info('Testing Organization Registration...');
  try {
    const response = await axios.post(`${API_URL}/auth/register`, organizationData);

    if (response.data.success) {
      log.success('Organization registered successfully!');
      log.info(`Organization ID: ${response.data.data.user._id}`);
      log.info(`Profile ID: ${response.data.data.profile._id}`);
      log.info(`Email: ${organizationData.email}`);
      return response.data.data.tokens.accessToken;
    }
  } catch (error) {
    log.error(`Organization registration failed: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testStudentLogin() {
  log.info('Testing Student Login...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: studentData.email,
      password: studentData.password
    });

    if (response.data.success) {
      log.success('Student login successful!');
      return response.data.data.tokens.accessToken;
    }
  } catch (error) {
    log.error(`Student login failed: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testOrganizationLogin() {
  log.info('Testing Organization Login...');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: organizationData.email,
      password: organizationData.password
    });

    if (response.data.success) {
      log.success('Organization login successful!');
      return response.data.data.tokens.accessToken;
    }
  } catch (error) {
    log.error(`Organization login failed: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testGetProfile(token, userType) {
  log.info(`Testing Get Profile for ${userType}...`);
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      log.success(`${userType} profile retrieved successfully!`);
      log.info(`User Role: ${response.data.data.user.role}`);
      log.info(`Email: ${response.data.data.user.email}`);
      return true;
    }
  } catch (error) {
    log.error(`Get profile failed: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 ========== AUTHENTICATION TEST SUITE ==========\n');

  // Test 1: Student Registration
  console.log('\n📝 Test 1: Student Registration');
  console.log('─────────────────────────────────────────────────');
  const studentToken = await testStudentRegistration();

  // Test 2: Organization Registration
  console.log('\n📝 Test 2: Organization Registration');
  console.log('─────────────────────────────────────────────────');
  const orgToken = await testOrganizationRegistration();

  // Wait a bit for database to sync
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Student Login
  console.log('\n📝 Test 3: Student Login');
  console.log('─────────────────────────────────────────────────');
  const studentLoginToken = await testStudentLogin();

  // Test 4: Organization Login
  console.log('\n📝 Test 4: Organization Login');
  console.log('─────────────────────────────────────────────────');
  const orgLoginToken = await testOrganizationLogin();

  // Test 5: Get Student Profile
  if (studentLoginToken) {
    console.log('\n📝 Test 5: Get Student Profile');
    console.log('─────────────────────────────────────────────────');
    await testGetProfile(studentLoginToken, 'Student');
  }

  // Test 6: Get Organization Profile
  if (orgLoginToken) {
    console.log('\n📝 Test 6: Get Organization Profile');
    console.log('─────────────────────────────────────────────────');
    await testGetProfile(orgLoginToken, 'Organization');
  }

  // Summary
  console.log('\n📊 ========== TEST SUMMARY ==========');
  console.log('─────────────────────────────────────────────────');
  log.info('All authentication tests completed!');
  log.info(`Student Email: ${studentData.email}`);
  log.info(`Student Password: ${studentData.password}`);
  log.info(`Organization Email: ${organizationData.email}`);
  log.info(`Organization Password: ${organizationData.password}`);
  console.log('\nℹ️  You can use these credentials to test login in the browser!');
  console.log('─────────────────────────────────────────────────\n');
}

// Run all tests
runTests().catch(console.error);
