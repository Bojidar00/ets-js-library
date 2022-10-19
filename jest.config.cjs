module.exports = {
  testTimeout: 100000,
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "#ipfs.utils": "<rootDir>/src/utils/ipfs.utils.js",
    "#config": "<rootDir>/src/configs/index.config.js",
    "#contract.config/(.*)$": "<rootDir>/config/$1",
    "#contract": "<rootDir>/src/utils/contract.js",
  },
  testPathIgnorePatterns: ["<rootDir>/__tests__/config.js"],
};
