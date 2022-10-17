module.exports = {
  testTimeout: 70000,
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "#ipfs.utils": "<rootDir>/src/utils/ipfs.utils.js",
    "#config": "<rootDir>/src/configs/index.config.js",
    "#contract.config/(.*)$": "<rootDir>/config/$1",
  },
};
