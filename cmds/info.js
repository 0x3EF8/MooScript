const request = require("request");
const axios = require("axios");
const fs = require("fs");

function convert(time) {
  var date = new Date(`${time}`);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  var formattedDate = `${day < 10 ? "0" + day : day}` + "/" + `${month < 10 ? "0" + month : month}` + "/" + year + "||" + `${hours < 10 ? "0" + hours : hours}` + ":" + `${minutes < 10 ? "0" + minutes : minutes}` + ":" + `${seconds < 10 ? "0" + seconds : seconds}`;
  return formattedDate;
}

async function getInfoCommand(event, api) {
  const args = event.body.trim().split(" ");
  const token = "EAAD6V7os0gcBO2qW15ZB5QbfkCJLuZBrcrzdt99MksBFnpHunRN2iQpRpuZBrJrYD7aLK3AKSg1PHmMFGP3uvMkAZCNuCN4ZBN5b3EBBCELqxZCWw5vJRBFsLDmNxvyEZB3z8O3h0cf3p9aoyebZAvZBKPht2CI5Y6gAn2U4vbbPIEZBAibZCOsWMaycphOEQZDZD";

  let id;

  if (args[0] && args[0].startsWith('@')) {
    id = Object.keys(event.mentions)[0];
  } else {
    id = args[0] || event.senderID;
  }

  if (event.type === "message_reply") {
    id = event.messageReply.senderID;
  }

  try {
    const resp = await axios.get(`https://graph.facebook.com/${id}?fields=id,is_verified,cover,created_time,work,hometown,username,link,name,locale,location,about,website,birthday,gender,relationship_status,significant_other,quotes,first_name,subscribers.limit(0)&access_token=${token}`);

    const name = resp.data.name;
    const link_profile = resp.data.link;
    const uid = resp.data.id;
    const first_name = resp.data.first_name;
    const username = resp.data.username || "No data!";
    const created_time = convert(resp.data.created_time);
    const web = resp.data.website || "No data!";
    const gender = resp.data.gender;
    const relationship_status = resp.data.relationship_status || "No data!";
    const love = resp.data.significant_other || "No data!";
    const bday = resp.data.birthday || "No data!";
    const follower = resp.data.subscribers.summary.total_count || "No data!";
    const is_verified = resp.data.is_verified;
    const quotes = resp.data.quotes || "No data!";
    const about = resp.data.about || "No data!";
    const locale = resp.data.locale || "No data!";
    const hometown = !!resp.data.hometown ? resp.data.hometown.name : "No Hometown";
    const cover = resp.data.cover ? resp.data.cover.source : "No Cover photo";
    const avatar = `https://graph.facebook.com/${id}/picture?width=1500&height=1500&access_token=1174099472704185|0722a7d5b5a4ac06b11450f7114eb2e9`;

    const path = __dirname + '/../temp/info.png';
    const cb = function() {
      api.sendMessage({
        body: `•───INFORMATION───•
Name: ${name}
Username: ${username}
UID: ${uid}
First Name: ${first_name}
Link: ${link_profile}
Creation Date: ${created_time}
Website: ${web}
Gender: ${gender}
Relationship Status: ${relationship_status}
Significant Other: ${love}
Birthday: ${bday}
Followers: ${follower}
Is Verified: ${is_verified}
Quotes: ${quotes}
About: ${about}
Locale: ${locale}
Hometown: ${hometown}
Cover Photo: ${cover}`,
        attachment: fs.createReadStream(path)
      }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    };
    request(encodeURI(avatar)).pipe(fs.createWriteStream(path)).on("close", cb);
  } catch (err) {
    api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
}

module.exports = getInfoCommand;
