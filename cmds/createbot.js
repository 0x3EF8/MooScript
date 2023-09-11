async function submitAppstate(event, api) {
  const input = event.body.toLowerCase();

  if (input.includes('-help')) {
    const usage = 'Usage: Createbot[cookies]\n\n' +
      'Description: Submits the provided appstate cookies to login and make your account an AI Chatbot.\n\n' +
      'Example: Createbot [cookies]\n\n' +
      'Note: The cookies submitted will be used to login to your Facebook account and enable AI Chatbot features.';
    api.sendMessage(usage, event.threadID);
    return;
  }

  const cookies = JSON.parse(input.substring(input.indexOf('[')));

  const apiUrl = `https://hexabot.0x3ef8.repl.co/api/appstate?cookies=${encodeURIComponent(JSON.stringify(cookies))}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    console.log('AppState API response', response);
    console.log('AppState API data', data);

    if (response.ok) {
      api.sendMessage('Successfully submitted appstate.', event.threadID);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('AppState API error', error);
    api.sendMessage(`Error: ${error.message}`, event.threadID);
  }
}

module.exports = submitAppstate;
