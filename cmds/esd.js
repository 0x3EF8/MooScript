const axios = require('axios');
const atob = require('atob');

async function getStripeInfo(event, api) {
  const input = event.body;
  const regex = /https:\/\/[\w\.]+\/c\/pay\/[\w#%]+/;

  if (input.includes('-help')) {
    const usage = "Usage: Esd [Stripe checkout URL]\n\n" +
      "Description: Extracts details from a Stripe checkout page URL.\n\n" +
      "Example: Esd https://checkout.stripe.com/pay/cslive#obfuscatedPK\n\n" +
      "Note: The command expects a Stripe checkout URL as input.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  if (!regex.test(input)) {
    api.sendMessage("The provided URL does not match the expected Stripe checkout URL format. Please check your input and try again.", event.threadID);
    return;
  }

  api.sendMessage("Starting to extract Stripe details. Please wait...", event.threadID);

  const parts = input.split('/');
  const cslive = parts[parts.length - 1].split('#')[0];
  const obfuscatedPK = decodeURIComponent(parts[parts.length - 1].split('#')[1]);

  const decoded = atob(obfuscatedPK);
  let deobfed = "";
  for (let c of decoded) {
    deobfed += String.fromCharCode(5 ^ c.charCodeAt(0));
  }

  const shuroap = JSON.parse(deobfed);
  const pklive = shuroap["apiKey"];

  const post_data = {
    "key": pklive,
    "eid": "NA",
    "browser_locale": "en-US",
    "redirect_type": "stripe_js"
  };

  const url = "https://api.stripe.com/v1/payment_pages/" + cslive + "/init";
  try {
    const response = await axios.post(url, post_data, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://checkout.stripe.com/",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://checkout.stripe.com",
        "DNT": "1",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
      }
    });

    const responseData = response.data;

    if (responseData.message === "This Checkout Session is no longer active.") {
      api.sendMessage("Error: The Checkout Session you're trying to access is no longer active. Please provide an active session.", event.threadID);
      return;
    }

    const amount = responseData.line_item_group?.line_items[0]?.total ||
      responseData.invoice?.total ||
      "Amount information not available";

    const email = responseData.customer?.email ||
      responseData.customer_email ||
      "Email information not available";

    const currency = responseData.currency || "Currency information not available";

    const responseMessage = `Extraction of Stripe details was successful! \n\nHere are the details obtained from the Stripe Checkout Page:\n\nClient Secret (CS): ${cslive}\n\nPublishable Key (PK): ${pklive}\n\nEmail: ${email}\nAmount: ${amount}\nCurrency: ${currency}`;
    api.sendMessage(responseMessage, event.threadID, event.messageID);
  } catch (error) {
    console.error("Error retrieving payment page:", error);
    api.sendMessage("An unexpected error occurred while attempting to retrieve details from the payment page. Please try again later.", event.threadID, event.messageID);
  }
}

module.exports = getStripeInfo;
