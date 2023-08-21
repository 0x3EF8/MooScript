module.exports = async ({
	api,
	event
}) => {
	const settingsFilePath = path.join(
		__dirname,
		".",
		"json",
		"settings.json"
	);
	const settings = JSON.parse(
		await fs.readFile(settingsFilePath, "utf8")
	);
	if (settings[1].joinleftnotif) {
		if (event.logMessageType == "log:subscribe") {
			require("../events/join-notif.js")({
				api,
				event
			});
		} else if (event.logMessageType == "log:unsubscribe") {
			require("./leave-notif.js")({
				api,
				event
			});
		} else {}
	}
}