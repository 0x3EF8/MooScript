const Koa = require('koa');
const Router = require('@koa/router');
const path = require('path');
const ejs = require('ejs');
const cors = require('@koa/cors');
const serve = require('koa-static');
const appstateHandler = require('./fbstateApi.js');
const pingHandler = require('./botscopeApi.js');
const EventEmitter = require('events');

global.ee = new EventEmitter();

const app = new Koa();
const router = new Router();

let appPort = process.env.APP_PORT || 3000;

const startServer = (port) => {
  router.get('/', async (ctx) => {
    const html = await ejs.renderFile(path.join(__dirname, 'index.ejs'), {});
    ctx.body = html;
  });
  /*
  router.post('/submit-form', async (ctx) => {
    const { email, password } = ctx.request.body;
    ctx.body = `Received user email: ${email}, password: ${password}`;
  });
  */

  router.get('/getfbstate', async (ctx) => {
    const html = await ejs.renderFile(path.join(__dirname, 'appstateget.ejs'), {});
    ctx.body = html;
  });

  router.get('/status', async (ctx) => {
    const html = await ejs.renderFile(path.join(__dirname, 'status.ejs'));
    ctx.body = html;
  });

  router.get('/api/ping', pingHandler.handlePing);

  router.get('/api/ping/status', (ctx) => {
    ctx.body = pingHandler.getStatus();
  });

  router.get('/api/ping/status/sse', async (ctx) => {
    ctx.response.set('Cache-Control', 'no-cache');
    ctx.response.set('Content-Type', 'text/event-stream');
    ctx.response.set('Connection', 'keep-alive');
    ctx.response.set('Access-Control-Allow-Origin', '*');

    ctx.req.setTimeout(Number.MAX_VALUE);

    const writeData = (data) => {
      ctx.res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    global.ee.on('data', writeData);

    ctx.res.on('close', () => {
      global.ee.off('data', writeData);
      ctx.res.end();
    });

    ctx.respond = false;
  });

  router.get('/api/appstate', appstateHandler);

  app.use(cors());

  app.use(serve(path.join(__dirname, 'public')));
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
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
    appPort = availablePort;
    startServer(appPort);
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });
