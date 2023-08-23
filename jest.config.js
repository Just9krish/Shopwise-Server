/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  verbose: true, // each individual test will be reported during run
  forceExit: true, // force exit after test run
  clearMocks: true, // clear mocks after each test run
};
