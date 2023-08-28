const axios = require('axios');
const fs = require('fs');
const path = require('path');

const urlsFilePath = path.join(__dirname, '..', 'json', 'urls.json');
let urlStats = {};

const heartbeatInterval = 1000; 
const urlExpiryInterval = 5 * 60 * 60 * 1000; 

function msToTime(duration) {
  const minutes = parseInt((duration / (1000 * 60)) % 60, 10);
  const hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);
  const days = parseInt(duration / (1000 * 60 * 60 * 24), 10);

  return `${days}d ${hours}h ${minutes}m`;
}

// function maskUrl(url) {
//   let urlObj = new URL(url);
//   let maskedHost = urlObj.host.split('.').map((part, i, arr) => {
//     if (i === arr.length - 1) return part; 
//     return part.split('').map((char, j) => j < part.length - 2 ? '*' : char).join('');
//   }).join('.');
//   return urlObj.protocol + '//' + maskedHost + urlObj.pathname;
// }

const pingUrl = async (urlObj) => {
  let status = 'down';
  let now = new Date();

  try {
    const response = await axios.get(urlObj.url);
    const ping = now - new Date(response.headers.date); 

    if (response.status === 200) {
      status = 'up';
    }

    if (!urlStats[urlObj.name]) {
      urlStats[urlObj.name] = {
        // url: maskUrl(urlObj.url),
        url: urlObj.url,
        status: status,
        upTime: '0d 0h 0m',
        downTime: '0d 0h 0m',
        addedDate: now,
        lastPing: now,
        lastUp: status === 'up' ? now : null,
        lastDown: status === 'down' ? now : null,
        ping: ping,
        warningMessage: '',
        timeUrlDown: 0
      };
    }

    const stat = urlStats[urlObj.name];
    stat.lastPing = now;
    stat.ping = ping;

    if (status === 'up') {
      if (stat.lastUp === null) {
        stat.lastUp = now;
      }
      stat.upTime = msToTime(now - stat.lastUp);
      stat.downTime = stat.lastDown ? msToTime(stat.lastUp - stat.lastDown) : '0d 0h 0m';
      stat.warningMessage = '';
      stat.timeUrlDown = 0;
    } else {
      if (stat.lastDown === null) {
        stat.lastDown = now;
      }
      stat.downTime = msToTime(now - stat.lastDown);
      stat.upTime = stat.lastUp ? msToTime(stat.lastDown - stat.lastUp) : '0d 0h 0m';
      stat.timeUrlDown += heartbeatInterval;

      if (stat.timeUrlDown >= 15 * 60 * 1000) {
        stat.warningMessage = `Oh no! The URL is down. It will be removed if it is still down after 5 hours. The URL has ${msToTime(urlExpiryInterval - stat.timeUrlDown)} left.`;
      }
    }

    stat.status = status;
    global.ee.emit('data', urlStats);
  } catch (error) {
    const stat = urlStats[urlObj.name];
    stat.status = 'down';
    if (stat.lastDown === null) {
      stat.lastDown = now;
    }
    stat.downTime = msToTime(now - stat.lastDown);
    stat.upTime = stat.lastUp ? msToTime(stat.lastDown - stat.lastUp) : '0d 0h 0m';
    stat.timeUrlDown += heartbeatInterval;
    stat.warningMessage = `Oh no! The URL is down. It will be removed if it is still down after 5 hours. The URL has ${msToTime(urlExpiryInterval - stat.timeUrlDown)} left.`;
    global.ee.emit('data', urlStats);
  }

  if (urlStats[urlObj.name] && urlStats[urlObj.name].timeUrlDown >= urlExpiryInterval) {
    const urls = JSON.parse(fs.readFileSync(urlsFilePath));
    urls.splice(urls.findIndex(u => u.name === urlObj.name), 1);
    delete urlStats[urlObj.name];
    fs.writeFileSync(urlsFilePath, JSON.stringify(urls, null, 2));
    console.log(`URL ${urlObj.url} removed as it was down for more than 5 hours.`);
  }
};

const initializeUrlStats = () => {
  if (fs.existsSync(urlsFilePath)) {
    const urlsFileContent = fs.readFileSync(urlsFilePath);
    const urls = JSON.parse(urlsFileContent);
    urls.forEach((urlObj) => {
      if (!urlStats[urlObj.name]) {
        const now = new Date();
        urlStats[urlObj.name] = {
          // url: maskUrl(urlObj.url),
          url: urlObj.url,
          status: 'unknown',
          upTime: '0d 0h 0m',
          downTime: '0d 0h 0m',
          addedDate: now,
          lastPing: now,
          lastUp: null,
          lastDown: null,
          ping: 0,
          warningMessage: '',
          timeUrlDown: 0
        };
      }
    });
  }
};

initializeUrlStats();

const pingAllUrls = () => {
  let urls = [];

  try {
    if (fs.existsSync(urlsFilePath)) {
      const urlsFileContent = fs.readFileSync(urlsFilePath);
      urls = JSON.parse(urlsFileContent);
    }
  } catch (error) {
    console.error(`Error reading URLs file: ${error}`);
  }

  urls.forEach(pingUrl);
};

setInterval(pingAllUrls, heartbeatInterval);

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports.getStatus = () => urlStats;

module.exports.getUrls = () => {
  let urls = [];
  try {
    if (fs.existsSync(urlsFilePath)) {
      const urlsFileContent = fs.readFileSync(urlsFilePath);
      urls = JSON.parse(urlsFileContent);
    }
  } catch (error) {
    console.error(`Error reading URLs file: ${error}`);
  }

  return urls;
};

module.exports.handlePing = async function pingHandler(ctx) {
  const { name, url } = ctx.request.query;

  if (!name || !url) {
    ctx.status = 400;
    ctx.body = { error: 'Both the name and URL must be specified in the query string.' };
    return;
  }

  if (!isValidUrl(url)) {
    ctx.status = 400;
    ctx.body = { error: 'Invalid URL.' };
    return;
  }

  let urls = [];
  if (fs.existsSync(urlsFilePath)) {
    const urlsFileContent = fs.readFileSync(urlsFilePath);
    urls = JSON.parse(urlsFileContent);
  }

  const existingUrlIndex = urls.findIndex(u => u.name === name);
  if (existingUrlIndex > -1) {
    ctx.status = 400;
    ctx.body = { error: 'The name is already in use.' };
    return;
  }

  urls.push({ name, url });
  fs.writeFileSync(urlsFilePath, JSON.stringify(urls, null, 2));
  ctx.status = 200;
  ctx.body = { message: 'URL added successfully.' };

  pingUrl({ name, url });
};
