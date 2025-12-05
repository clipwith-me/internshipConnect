/**
 * Artillery Custom Functions
 *
 * Helper functions for load testing scenarios
 */

const faker = require('faker');

/**
 * Generate random test user
 */
function generateTestUser(context, events, done) {
  context.vars.testEmail = `loadtest${Date.now()}${Math.random()}@example.com`;
  context.vars.testPassword = 'LoadTest123!';
  context.vars.testFirstName = faker.name.firstName();
  context.vars.testLastName = faker.name.lastName();
  return done();
}

/**
 * Generate random internship data
 */
function generateInternshipData(context, events, done) {
  context.vars.internshipTitle = faker.name.jobTitle();
  context.vars.internshipDescription = faker.lorem.paragraphs(3);
  context.vars.internshipLocation = faker.address.city();
  context.vars.internshipSalary = Math.floor(Math.random() * 5000) + 2000;
  return done();
}

/**
 * Generate random student profile data
 */
function generateStudentProfile(context, events, done) {
  context.vars.studentSkills = [
    faker.name.jobArea(),
    faker.name.jobType(),
    faker.hacker.noun()
  ];
  context.vars.studentGPA = (Math.random() * 1.5 + 2.5).toFixed(2); // 2.5 - 4.0
  context.vars.studentMajor = faker.name.jobType();
  return done();
}

/**
 * Hook: Before scenario
 */
function beforeScenarioHook(context, events, done) {
  context.vars.startTime = Date.now();
  return done();
}

/**
 * Hook: After scenario
 */
function afterScenarioHook(context, events, done) {
  const duration = Date.now() - context.vars.startTime;
  console.log(`Scenario completed in ${duration}ms`);
  return done();
}

/**
 * Hook: Collect response metrics
 */
function collectResponseMetrics(requestParams, response, context, events, done) {
  // Track error responses
  if (response.statusCode >= 400) {
    events.emit('counter', `errors.${response.statusCode}`, 1);
  }

  // Track slow responses
  if (response.timings.phases.total > 1000) {
    events.emit('counter', 'slow_responses', 1);
  }

  // Track endpoint-specific metrics
  const endpoint = requestParams.url.split('?')[0];
  events.emit('histogram', `response_time.${endpoint}`, response.timings.phases.total);

  return done();
}

/**
 * Validate response data
 */
function validateResponse(requestParams, response, context, events, done) {
  if (!response.body) {
    events.emit('counter', 'validation.empty_response', 1);
  }

  try {
    const body = JSON.parse(response.body);

    if (!body.success && response.statusCode < 400) {
      events.emit('counter', 'validation.invalid_success_flag', 1);
    }

    if (body.error && response.statusCode < 400) {
      events.emit('counter', 'validation.unexpected_error', 1);
    }
  } catch (error) {
    events.emit('counter', 'validation.json_parse_error', 1);
  }

  return done();
}

/**
 * Simulate realistic user think time
 */
function thinkTime(context, events, done) {
  // Random think time between 1-5 seconds
  const delay = Math.floor(Math.random() * 4000) + 1000;
  setTimeout(done, delay);
}

/**
 * Generate random search query
 */
function generateSearchQuery(context, events, done) {
  const skills = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js',
    'TypeScript', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP',
    'Ruby', 'Vue.js', 'Angular', 'Django', 'Flask', 'Spring'
  ];

  const locations = [
    'remote', 'New York', 'San Francisco', 'Los Angeles', 'Chicago',
    'Boston', 'Seattle', 'Austin', 'Denver', 'Miami'
  ];

  const categories = [
    'software-development', 'data-science', 'design', 'marketing',
    'sales', 'finance', 'hr', 'operations', 'research'
  ];

  // Random selection
  context.vars.searchSkills = faker.random.arrayElements(skills, 3);
  context.vars.searchLocation = faker.random.arrayElement(locations);
  context.vars.searchCategory = faker.random.arrayElement(categories);

  return done();
}

/**
 * Calculate and emit custom metrics
 */
function emitCustomMetrics(context, events, done) {
  const scenarios = context.vars.$processedScenarios || 0;
  events.emit('counter', 'scenarios_completed', scenarios);

  return done();
}

module.exports = {
  generateTestUser,
  generateInternshipData,
  generateStudentProfile,
  beforeScenarioHook,
  afterScenarioHook,
  collectResponseMetrics,
  validateResponse,
  thinkTime,
  generateSearchQuery,
  emitCustomMetrics
};
