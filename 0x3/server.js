const fs = require("fs").promises;
const Koa = require('koa');
const Router = require('koa-router');
const ejs = require('ejs');
const path = require('path');
const moment = require('moment-timezone');
const chalk = require('chalk');
const markdownIt = require('markdown-it')(); 

const appstateHandler = require('./fbstateApi.js');

const app = new Koa();
const router = new Router();

const appPort = process.env.APP_PORT || 3000;

const startServer = (port) => {
  router.get('/', async (ctx) => {
    const html = await ejs.renderFile(path.join(__dirname, 'index.ejs'), {});
    ctx.body = html;
  });

  router.get('/README.md', async (ctx) => {
    try {
      const readmeContent = await fs.readFile(path.join(__dirname, 'README.md'), 'utf8');
      const htmlContent = markdownIt.render(readmeContent); 
      ctx.body = htmlContent;
      ctx.type = 'text/html'; 
    } catch (err) {
      ctx.status = 404;
      ctx.body = 'README.md not found';
    }
  });

  router.get('/getfbstate', async (ctx) => {
    const html = await ejs.renderFile(path.join(__dirname, 'appstateget.ejs'), {});
    ctx.body = html;
  });

  router.get('/api/appstate', appstateHandler);

  moment.tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(port, () => {
    const formattedTime = moment.tz('Asia/Manila').format('MM/DD/YY hh:mm A');
    console.log(chalk.cyan(`[SYSTEM] Status: ONLINE\n[NETWORK] Running on PORT: ${port}`));
    console.log(chalk.green(`[TIME] Server initiated at: ${formattedTime}`));
  });
};

const findAvailablePort = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      server.close();
      resolve(port);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(port + 1));
      } else {
        reject(err);
      }
    });
  });
};

findAvailablePort(appPort)
  .then((availablePort) => {
    startServer(availablePort);
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });
