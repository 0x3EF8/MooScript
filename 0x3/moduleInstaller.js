const chalk = require("chalk");
const childProcess = require("child_process");

let missingModules = [];
let installingModules = new Set();

function handleError(message, error) {
    console.error(chalk.red("ERROR: An unexpected error has occurred."), error);
    console.log(message);

    if (error.code === "MODULE_NOT_FOUND") {
        const moduleName = error.message.split("'")[1];

        if (!missingModules.includes(moduleName) && !installingModules.has(moduleName)) {
            missingModules.push(moduleName);
            console.log(chalk.yellow(`Module "${moduleName}" is not installed. Attempting to install now...`));
            installingModules.add(moduleName);
            installModule(moduleName);
        }
    }
}

function installModule(moduleName) {
    childProcess.exec(`npm install ${moduleName}`, (err, stdout, stderr) => {
        if (err) {
            console.log(chalk.red(`Failed to install module "${moduleName}"`));
            console.log(stderr);
        } else {
            console.log(chalk.green(`Module "${moduleName}" has been successfully installed.`));
            missingModules = missingModules.filter((module) => module !== moduleName);
            installingModules.delete(moduleName);

            if (installingModules.size === 0) {
                console.log(chalk.blue("\nAll modules have been successfully installed. \n\nRestarting the system...\n"));
                process.exit(1);
            }
        }
    });
}

module.exports = {
    handleError
};
