const path = require("path");
const fs = require("fs").promises;
const login = require("fca-unofficial");
const ProgressBar = require("progress");
const chalk = require("chalk");
const figlet = require("figlet");
const { handleError } = require('./0x3/moduleInstaller.js');
require("./0x3/server.js");
const bes = require('./cmds/bes.js');

const appstateFolderPath = path.join(
  __dirname,
  "0x3",
  "credentials",
  "cookies"
);

figlet.text(
  "Hexabot",
  {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  },
  async (err, data) => {
    if (err) {
      console.log(chalk.red("Error rendering HEXABOT ASCII art."));
      console.dir(err);
      return;
    }

    console.log(chalk.cyan(data));
    console.log(chalk.gray("Developed by HEXCLAN | © 2023"));
    console.log(chalk.gray("This bot is not for sale"));
    console.log(chalk.gray("Repository: https://github.com/0x3EF8/Hexabot"));
    console.log();

    try {
      const files = await fs.readdir(appstateFolderPath);
      const appStates = files.filter((file) => path.extname(file) === ".json");

      const cmdFolder = path.join(__dirname, "cmds");
      const cmdFiles = await fs.readdir(cmdFolder);

      const bar = new ProgressBar(chalk.cyan(":bar") + " :percent :etas", {
        total: cmdFiles.length,
        width: 40,
        complete: "█",
        incomplete: " ",
        renderThrottle: 1,
      });

      const commandFiles = {};
      const commandErrors = [];

      for (const file of cmdFiles) {
        const commandName = file.split(".")[0].toLowerCase();

        try {
          commandFiles[commandName] = require(path.join(cmdFolder, file));
        } catch (error) {
          commandErrors.push({ fileName: file, error });
        }

        bar.tick();
      }

      if (bar.complete) {
        console.log(chalk.green(`\n✅ Commands successfully integrated: ${cmdFiles.length - commandErrors.length}`));

        if (commandErrors.length > 0) {
          console.log(chalk.red(`⚠️  Alert: ${commandErrors.length} command${commandErrors.length === 1 ? '' : 's'} could not be integrated:`));
          for (const { fileName, error } of commandErrors) {
            console.log(chalk.red(`Error detected in file: ${fileName}`));
            console.log(chalk.red(`Reason: ${error}`));
            if (error.stack) {
              const stackLines = error.stack.split('\n');
              const lineNumber = stackLines[1].match(/:(\d+):\d+\)$/)[1];
              console.log(chalk.red(`Line: ${lineNumber}`));
            }
            console.log(chalk.red(`---------------------------------`));
          }
          console.log();
        }
      }
      const userInformation = [];

      function displayUserInformation() {
        console.log("--------------------------------------------------");
        console.log(chalk.cyan("User Authentication Report"));
        console.log("--------------------------------------------------");
        for (const { userName, appState } of userInformation) {
          console.log(chalk.green(`Verified User: ${userName}`));
          console.log(`Authentication Record: ${appState}`);
        }
        console.log("--------------------------------------------------");
      }

      let completedLogins = 0;
      const loginPromises = [];

      for (const appState of appStates) {
        const appStateData = JSON.parse(
          await fs.readFile(path.join(appstateFolderPath, appState), "utf8")
        );

        const loginPromise = new Promise((resolve) => {
          login({ appState: appStateData }, async (err, api) => {
            if (err) {
              handleError(
                `❌ Login failed. Authentication record: ${appState}`,
                err
              );
              resolve(null);
              return;
            }

            api.setOptions({
              listenEvents: true,
              selfListen: false,
              autoMarkRead: false,
              autoMarkDelivery: false,
              forceLogin: true,
            });

            api.getUserInfo(api.getCurrentUserID(), (err, ret) => {
              if (err) {
                handleError(
                  `❌ Failed to retrieve user information. Authentication record: ${appState}`,
                  err,
                  api
                );
                return;
              }

              if (ret && ret[api.getCurrentUserID()]) {
                const userName = ret[api.getCurrentUserID()].name;
                userInformation.push({ userName, appState });
              }

              completedLogins++;
              if (completedLogins === appStates.length) {
                displayUserInformation();
              }
            });

            resolve(api);
          });
        });

        loginPromises.push(loginPromise);
      }

      const apis = await Promise.all(loginPromises);

      for (let i = 0; i < apis.length; i++) {
        const api = apis[i];
        if (!api) {
          const appStateToDelete = appStates[i];
          console.log(chalk.yellow(`Initiating secure deletion of appstate file: ${appStateToDelete}`));

          setTimeout(async () => {
            try {
              await fs.unlink(path.join(appstateFolderPath, appStateToDelete));
              console.log(chalk.green(`✅ Appstate file successfully deleted: ${appStateToDelete}`));
            } catch (deleteError) {
              console.error(chalk.red(`❌ Error during appstate file deletion: ${appStateToDelete}`, deleteError));
            }
          }, 5000);
          continue;
        }

        api.listenMqtt(async (err, event) => {
          if (err) {
            handleError("Error in MQTT listener:", err, api);
            return;
          }

          try {
            if (event.type === "message" || event.type === "message_reply") {
              const input = event.body.toLowerCase().trim();
              const matchingCommand = Object.keys(commandFiles).find(
                (commandName) => {
                  const commandPattern = new RegExp(
                    `^${commandName}(\\s+.*|$)`
                  );
                  return commandPattern.test(input);
                }
              );

              const settingsFilePath = path.join(
                __dirname,
                ".",
                "json",
                "settings.json"
              );
              const settings = JSON.parse(
                await fs.readFile(settingsFilePath, "utf8")
              );

              const userpanelFilePath = path.join(
                __dirname,
                ".",
                "json",
                "userpanel.json"
              );
              const userpanel = JSON.parse(
                await fs.readFile(userpanelFilePath, "utf8")
              );

              if (matchingCommand) {
                const cmd = commandFiles[matchingCommand];
                if (!settings[0].sys &&
                  !userpanel.userpanel.VIPS.includes(event.senderID)) {
                  api.sendMessage(
                    "⚠️ Alert: The system is currently undergoing maintenance.\nNote: Only authorized users are permitted to use commands during this period.",
                    event.threadID
                  );
                  return;
                }

                if (cmd) {
                  if (cmd.config && cmd.run) {
                    cmd.run({ api, event });
                  } else if (typeof cmd === "function") {
                    cmd(event, api);
                  } else if (cmd.onStart) {
                    cmd.onStart(event, api);
                  }
                }
              } else {
                const isPrivateThread = event.threadID == event.senderID;
                const isGroupChat = !isPrivateThread;
                const startsWithQuestion = /^(what|how|did|where|hi|hello|if|do)\b/i.test(input);
                if (isPrivateThread) {
                  bes(event, api);
                } else if (isGroupChat && startsWithQuestion) {
                  bes(event, api);
                }
              }
            }
          } catch (error) {
            handleError(
              "An error occurred in the listenMqtt function:",
              error,
              api
            );
          }
        });
      }

    } catch (error) {
      handleError("Error reading directory:", error);
    }
  }
);
