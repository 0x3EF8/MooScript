const axios = require('axios');

async function geninfo(event, api) {
  const input = event.body.toLowerCase().trim();
  if (input.startsWith("geninfo")) {
    const inputArr = input.split(" ");
    const country = inputArr.length > 1 ? inputArr[1].toUpperCase() : "US";

    if (inputArr.length > 1 && inputArr[1] == '-help') {
      const usage = "Usage: geninfo [country_code]\n\n";
      const description = "Description: Generates random person information based on the country code.\n\n";
      const example = "Example: geninfo US\n\n";
      const note = "Note: The country code should be an ISO 3166-1 alpha-2 country code. If no country code is provided, the default country is set to US.\n\n" +
        "List of country codes:\n" +
        "United States: US\n" +
        "United Kingdom: GB\n" +
        "Canada: CA\n" +
        "Australia: AU\n" +
        "Germany: DE\n" +
        "France: FR\n" +
        "Italy: IT\n" +
        "Spain: ES\n" +
        "Netherlands: NL\n" +
        "Switzerland: CH\n" +
        "Brazil: BR\n" +
        "Mexico: MX\n" +
        "Argentina: AR\n" +
        "Colombia: CO\n" +
        "Chile: CL\n" +
        "Peru: PE\n" +
        "Ecuador: EC\n" +
        "Uruguay: UY\n" +
        "Paraguay: PY\n" +
        "Bolivia: BO\n" +
        "Costa Rica: CR\n" +
        "Dominican Republic: DO\n" +
        "Panama: PA\n" +
        "Puerto Rico: PR\n" +
        "Jamaica: JM\n" +
        "Bahamas: BS\n" +
        "Trinidad and Tobago: TT\n" +
        "Barbados: BB\n" +
        "Saint Lucia: LC\n" +
        "Saint Vincent and the Grenadines: VC\n" +
        "Grenada: GD\n" +
        "Antigua and Barbuda: AG\n" +
        "Dominica: DM\n" +
        "Saint Kitts and Nevis: KN";
      
      const message = usage + description + example + note;
      api.sendMessage(message, event.threadID);
      return;
    }

    let url = "https://randomuser.me/api/1.4/?exc=picture,id,dob,registered,login,nat&nat=" + country + "&noinfo";

    try {
      const response = await axios.get(url);
      const data = response.data;
      const results = data.results[0];
      const gender = results.gender;
      const firstName = results.name.first;
      const lastName = results.name.last;
      const streetNumber = results.location.street.number;
      const streetName = results.location.street.name;
      const city = results.location.city;
      const state = results.location.state;
      const country = results.location.country;
      const postcode = results.location.postcode;
      const latitude = results.location.coordinates.latitude;
      const longitude = results.location.coordinates.longitude;
      const timezoneOffset = results.location.timezone.offset;
      const timezoneDescription = results.location.timezone.description;
      const email = results.email;
      const phone = results.phone;
      const cell = results.cell;

      const message = `Random Person Information\n\n` +
        `Gender: ${gender}\n` +
        `Name: ${firstName} ${lastName}\n\n` +
        `Location:\n` +
        `  Street: ${streetNumber} ${streetName}\n` +
        `  City: ${city}\n` +
        `  State: ${state}\n` +
        `  Country: ${country}\n` +
        `  Postcode: ${postcode}\n` +
        `  Coordinates: (${latitude}, ${longitude})\n` +
        `  Timezone: ${timezoneOffset} ${timezoneDescription}\n\n` +
        `Contact:\n` +
        `  Email: ${email}\n` +
        `  Phone: ${phone}\n` +
        `  Cell: ${cell}`;

      api.sendMessage(message, event.threadID);
    } catch (error) {
      console.log(error);
      api.sendMessage("Error getting data. Please try again later.", event.threadID);
    }
  }
}

module.exports = geninfo;
