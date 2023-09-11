const axios = require('axios');
const totp = require('totp-generator');

async function gst(event, api) {
  const input = event.body;

  if (input.includes('-help')) {
    const usage = "Usage: gst [username] [password] [2factor]\n\n" +
      "Description: Retrieve Facebook cookies and access token.\n\n" +
      "Example: gst Elcano0x7 0x3ef8\n\n" +
      "Note: If 2-factor authentication is enabled, provide the 2-factor code as the third argument.";
    api.sendMessage(usage, event.threadID, event.messageID);
    return;
  }

  const args = input.split(' ');

  if (args.length < 3) {
    api.sendMessage('Invalid usage. Type gst -help for command details.', event.threadID);
    return;
  }

  const username = args[1];
  const password = args[2];
  const twofactor = args[3] || '0';

  const deviceID = require('uuid').v4();
  const adid = require('uuid').v4();

  const form = {
    adid: adid,
    email: username,
    password: password,
    format: 'json',
    device_id: deviceID,
    cpl: 'true',
    family_device_id: deviceID,
    locale: 'en_US',
    client_country_code: 'US',
    credentials_type: 'device_based_login_password',
    generate_session_cookies: '1',
    generate_analytics_claim: '1',
    generate_machine_id: '1',
    currently_logged_in_userid: '0',
    irisSeqID: 1,
    try_num: '1',
    enroll_misauth: 'false',
    meta_inf_fbmeta: 'NO_FILE',
    source: 'login',
    machine_id: randomString(24),
    meta_inf_fbmeta: '',
    fb_api_req_friendly_name: 'authenticate',
    fb_api_caller_class: 'com.facebook.account.login.protocol.Fb4aAuthHandler',
    api_key: '882a8490361da98702bf97a021ddc14d',
    access_token: '350685531728%7C62f8ce9f74b12f84c123cc23437a4a32'
  };

  form.sig = encodesig(sort(form));

  const options = {
    url: 'https://b-graph.facebook.com/auth/login',
    method: 'post',
    data: form,
    transformRequest: [(data, headers) => require('querystring').stringify(data)],
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-fb-friendly-name': form['fb_api_req_friendly_name'],
      'x-fb-http-engine': 'Liger',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    },
  };

  try {
    const response = await axios.request(options);

    if (response.data.error && response.data.error.code === 401) {
      api.sendMessage(response.data.error.message, event.threadID);
      return;
    }

    if (twofactor === '0' || twofactor === 'disable') {
      const accessToken = await convertToken(response.data.access_token);
      const cookies = await convertCookie(response.data.session_cookies);

      api.sendMessage('Information retrieved successfully!\n\nCookies:\n' + cookies + '\n\nAccess Token: ' + accessToken, event.threadID);
    } else {
      let _2fa = '0';

      if (twofactor !== '0') {
        try {
          _2fa = totp(decodeURI(twofactor).replace(/\s+/g, '').toLowerCase());
        } catch (e) {
          api.sendMessage('Invalid 2-factor authentication code!', event.threadID);
          return;
        }
      }

      form.twofactor_code = _2fa;
      form.encrypted_msisdn = '';
      form.userid = response.data.error.error_data.uid;
      form.machine_id = response.data.error.error_data.machine_id;
      form.first_factor = response.data.error.error_data.login_first_factor;
      form.credentials_type = 'two_factor';
      form.sig = encodesig(sort(form));

      options.data = form;

      const response2fa = await axios.request(options);
      const accessToken = await convertToken(response2fa.data.access_token);
      const cookies = await convertCookie(response2fa.data.session_cookies);

      api.sendMessage('Information retrieved successfully with 2-factor authentication!\n\nCookies:\n' + cookies + '\n\nAccess Token: ' + accessToken, event.threadID);
    }
  } catch (error) {
    api.sendMessage('Failed to retrieve information. Please check your input and try again.', event.threadID);
    console.error('Error:', error.response.data);
  }
}

async function convertCookie(seasion) {
  let cookie = '';
  for (let i = 0; i < seasion.length; i++) {
    cookie += seasion[i].name + '=' + seasion[i].value + '; ';
  }
  return cookie;
}

async function convertToken(token) {
  return new Promise((resolve) => {
    axios.get(`https://api.facebook.com/method/auth.getSessionforApp?format=json&access_token=${token}&new_app_id=275254692598279`).then((response) => {
      if (response.data.error) {
        resolve();
      } else {
        resolve(response.data.access_token);
      }
    });
  });
}

function randomString(length) {
  length = length || 10;
  let char = 'abcdefghijklmnopqrstuvwxyz';
  char = char.charAt(Math.floor(Math.random() * char.length));
  for (let i = 0; i < length - 1; i++) {
    char += 'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(36 * Math.random()));
  }
  return char;
}

function encodesig(string) {
  let data = '';
  Object.keys(string).forEach(function (info) {
    data += info + '=' + string[info];
  });
  data = md5(data + '62f8ce9f74b12f84c123cc23437a4a32');
  return data;
}

function md5(string) {
  return require('crypto').createHash('md5').update(string).digest('hex');
}

function sort(string) {
  const sor = Object.keys(string).sort();
  const data = {};
  for (let i in sor) data[sor[i]] = string[sor[i]];
  return data;
}

module.exports = gst;
