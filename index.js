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

      for (const file of cmdFiles) {
        const commandName = file.split(".")[0].toLowerCase();

        try {
          commandFiles[commandName] = require(path.join(cmdFolder, file));
        } catch (error) {
          handleError(`Failed to load command file: ${file}.`, error);
        }

        bar.tick();
      }

      if (bar.complete) {
        console.log(chalk.green(`\nCommands loaded successfully: ${bar.curr}`));
        console.log(
          chalk.red(`Failed to load commands: ${bar.total - bar.curr}\n`)
        );
      }

      const userInformation = [];

      function displayUserInformation() {
        console.log("--------------------------------------------------");
        console.log(chalk.green("Login Successful!"));
        console.log("--------------------------------------------------");
        for (const { userName, appState } of userInformation) {
          console.log(chalk.green(`User: ${userName} logged in successfully.`));
          console.log(`AppState file: ${appState}`);
        }
        console.log("--------------------------------------------------");
      }

      let completedLogins = 0;

      for (const appState of appStates) {
        try {
          const appStateData = JSON.parse(
            await fs.readFile(path.join(appstateFolderPath, appState), "utf8")
          );

          login({ appState: appStateData }, (err, api) => {
            if (err) {
              handleError(
                `Failed to login. AppState file: ${appState}.`,
                err
              );
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
                  `Failed to get user info. AppState file: ${appState}.`,
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
                        "⚠️ Oops: \n\nThe system is currently under maintenance. \nNote: Only authorized users may use commands during this state.",
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
          });
        } catch (error) {
          handleError(
            `Failed to read appstate file: ${appState}.`,
            error
          );
        }
      }
    } catch (error) {
      handleError("Error reading directory:", error);
    }
  }
);
