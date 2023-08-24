const fs = require("fs");

let packages = JSON.parse(fs.readFileSync("../package.json", "utf8"));

fs.writeFileSync("../.update/package.json", JSON.stringify({name: packages.name, description: packages.description, version: packages.version, code: parseInt((packages.version).replaceAll(".", "")), changes: packages.whats_new}), "utf8");