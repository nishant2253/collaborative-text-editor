module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
  moduleNameMapper: {
    "^socket.io$": "<rootDir>/node_modules/socket.io/dist/index.js",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
};
