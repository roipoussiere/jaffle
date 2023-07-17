// Jest configuration file - see https://jestjs.io/docs/configuration

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	clearMocks: true,
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageProvider: 'v8',
	errorOnDeprecated: true,
	maxWorkers: '100%',
	notify: false,
	notifyMode: 'failure-change',
	preset: 'ts-jest',
	slowTestThreshold: 1,
	testEnvironment: 'jsdom',
	testMatch: ['**/tests/**/*.test.ts'],
};
