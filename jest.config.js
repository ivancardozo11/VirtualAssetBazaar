export default {
    testEnvironment: 'node',
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        '**/src/**/*.js'
    ],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    testTimeout: 1000000
};
