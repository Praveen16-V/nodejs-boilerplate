// Runtime bootstrap script
require("tsconfig-paths/register");
const server = require("./dist/server.js");
server.startServer();
