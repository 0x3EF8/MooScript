const axios = require('axios');
const fs = require('fs');

async function periodic(event, api, input) {
  if (input.includes('-help')) {
    const usage = "Usage: periodic [element]\n\n" +
      "Description: Retrieves information about the specified chemical element from the periodic table.\n\n" +
      "Example: periodic FE\n\n" +
      "Note: The command expects the name of the chemical element as the argument.";
    api.sendMessage(usage, event.threadID);
    return;
  }

  let data = input.split(" ");
  data.shift();

  if (data.length > 0) {
    try {
      const response = await axios.get("https://api.popcat.xyz/periodic-table?element=" + data.join(" "));
      const elementData = response.data;

      const imageResponse = await axios.get(elementData.image, {
        responseType: "stream"
      });
      const imagePath = __dirname + "/../temp/element.png";
      const imageStream = fs.createWriteStream(imagePath);
      imageResponse.data.pipe(imageStream);

      await new Promise((resolve, reject) => {
        imageStream.on("finish", () => {
          const message = {
            body: `${elementData.name}\n\nSymbol : ${elementData.symbol}\nAtomic Number : ${elementData.atomic_number}\nAtomic Mass : ${elementData.atomic_mass}\nPeriod : ${elementData.period}\nPhase : ${elementData.phase}\nDiscovered by : ${elementData.discovered_by}\n\nSummary\n${elementData.summary}`,
            attachment: fs.createReadStream(imagePath),
          };
          api.sendMessage(message, event.threadID, event.messageID)
            .then(() => resolve())
            .catch((error) => reject(error));
        });
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("There was an error retrieving data for the provided element.", event.threadID, event.messageID);
    }
  } else {
    api.sendMessage(`Undefined request.\n\nPeriodic <element>`, event.threadID, event.messageID);
  }
}

module.exports = periodic;
