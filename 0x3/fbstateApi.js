const fs = require('fs');
const path = require('path');

const appStateDirectory = path.join(__dirname, 'credentials', 'cookies');

module.exports = async function appstateHandler(ctx) {
  let { cookies } = ctx.request.query;
  if (!cookies) {
    ctx.status = 400;
    ctx.body = { error: 'The "cookies" parameter is required.' };
    return;
  }

  let appStateData;
 
  try {
    appStateData = JSON.parse(cookies.replace(/\\/g, ''));
    if (!Array.isArray(appStateData) || appStateData.some(obj => typeof obj !== 'object')) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid "cookies". It should be an array of objects.' };
      return;
    }
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid "cookies". It should be a valid JSON.' };
    return;
  }

  const requiredKeys = ['key', 'value', 'domain', 'path', 'hostOnly', 'creation', 'lastAccessed'];
  const isValidAppState = appStateData.every(state =>
    requiredKeys.every(key => Object.prototype.hasOwnProperty.call(state, key))
  );

  if (!isValidAppState) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid "cookies". It should adhere to the required structure.' };
    return;
  }

  const appStateFiles = fs.readdirSync(appStateDirectory);
  const existingAppStateValues = appStateFiles.flatMap((fileName) => {
    const fileContent = fs.readFileSync(path.join(appStateDirectory, fileName));
    const fileAppState = JSON.parse(fileContent);
    return fileAppState;
  });

  const isDuplicate = appStateData.some(newCookie => 
    existingAppStateValues.some(existingCookie => 
      JSON.stringify(newCookie) === JSON.stringify(existingCookie)));

  if (isDuplicate) {
    ctx.status = 400;
    ctx.body = { error: 'Duplicate "cookies" detected. Please ensure each appstate is unique.' };
    return;
  }

  const fbUID = appStateData.find(cookie => cookie.key === 'c_user').value;
  const fileName = `${fbUID}.json`;
  const filePath = path.join(appStateDirectory, fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(appStateData, null, 2));
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: `Error while creating the file: ${error.message}` };
    return;
  }

  ctx.status = 200;
  ctx.body = { message: 'AppState saved successfully.', name: fbUID };

  setTimeout(() => {
    process.exit(0);
  }, 1000);
};