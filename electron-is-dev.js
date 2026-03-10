// electron-is-dev.js - Determine if running in development
const isDev = require('electron-is-dev') || process.env.NODE_ENV === 'development';
module.exports = isDev;
