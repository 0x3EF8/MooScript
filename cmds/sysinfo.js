const os = require("os");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function systemInfoCommand(event, api) {
  try {
    // Get system information
    const machine = os.hostname();
    const osType = os.type();
    const osArch = os.arch();
    const osVersion = os.release();
    const osPlatform = os.platform();
    const uptime = os.uptime();

    // Get RAM information
    const totalRam = os.totalmem() / (1024 * 1024); // Convert to MB
    const freeRam = os.freemem() / (1024 * 1024); // Convert to MB

    // Get ROM information
    const { stdout: romInfo } = await exec("df -h /");

    // Get ping information
    const { stdout: pingInfo } = await exec("ping -c 4 google.com");

    // Get MAC address
    const { stdout: macAddress } = await exec("ifconfig | grep ether");

    // Get local IP address
    const { stdout: ipAddress } = await exec("hostname -I | awk '{print $1}'");

    const message = `
    ｢System Info｣

    • Machine » ${machine}
    • OS » ${osType}
    • Arch » ${osArch}
    • Version » ${osVersion}
    • Platform » ${osPlatform}
    • Uptime » ${uptime.toFixed(2)} seconds
    • RAM » Total: ${totalRam.toFixed(2)} MB / Free: ${freeRam.toFixed(2)} MB

    ｢ROM Info｣
    
    ${romInfo}

    ｢Ping Info｣

    ${pingInfo}

    ｢Network Info｣

    • MAC Address » ${macAddress}
    • IP Address » ${ipAddress}
    `;

    api.sendMessage({ body: message }, event.threadID, event.messageID);
  } catch (err) {
    console.error('Error:', err);
    api.sendMessage(`An error occurred while retrieving system information.`, event.threadID, event.messageID);
  }
}

module.exports = systemInfoCommand;
