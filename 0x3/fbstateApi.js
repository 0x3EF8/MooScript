const fs = require('fs');
const path = require('path');

const appStateDirectory = path.join(__dirname, 'credentials', 'cookies');
const requiredCookieKeys = ['key', 'value', 'domain', 'path', 'hostOnly', 'creation', 'lastAccessed'];

module.exports = async function appstateHandler(ctx) {
  let { cookies } = ctx.request.query;
  if (!cookies) {
    ctx.throw(400, 'The "cookies" parameter is required.');
  }

  let appStateData;

  try {
    appStateData = JSON.parse(cookies.replace(/\\/g, ''));
    if (!Array.isArray(appStateData) || appStateData.some(cookie => !isValidCookieStructure(cookie))) {
      ctx.throw(400, 'Invalid "cookies". It should be an array of objects with the correct structure.');
    }
  } catch (error) {
    ctx.throw(400, 'Invalid JSON in "cookies" parameter.');
  }

  const existingAppStateValues = getExistingAppStateValues();

  if (isDuplicateCookie(appStateData, existingAppStateValues)) {
    ctx.throw(400, 'Duplicate cookies detected. Please ensure each appstate is unique.');
  }

  const fbUID = appStateData.find(cookie => cookie.key === 'c_user').value;
  const fileName = `${fbUID}.json`;
  const filePath = path.join(appStateDirectory, fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(appStateData, null, 2));
    ctx.status = 200;
    ctx.body = { message: 'AppState saved successfully.', name: fbUID };
  } catch (error) {
    ctx.throw(500, `Error while saving the app state: ${error.message}`);
  }

  gracefullyExitProcess();
};

function isValidCookieStructure(cookie) {
  return requiredCookieKeys.every(key => Object.prototype.hasOwnProperty.call(cookie, key));
}

function getExistingAppStateValues() {
  return fs.readdirSync(appStateDirectory).flatMap(fileName => {
    const filePath = path.join(appStateDirectory, fileName);
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileAppState = JSON.parse(fileContent);
      return fileAppState;
    } catch (error) {
      console.error(`Error parsing JSON in file ${filePath}: ${error}`);
      return [];
    }
  });
}

function isDuplicateCookie(newCookies, existingCookies) {
  return newCookies.some(newCookie => existingCookies.some(existingCookie => JSON.stringify(newCookie) === JSON.stringify(existingCookie)));
}

function gracefullyExitProcess() {
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}
