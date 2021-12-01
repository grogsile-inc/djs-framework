const index = function(dir, recursive = Infinity, ...args)
{
	const fs = require("fs")
		, files = fs.readdirSync(dir)
		, modules = {};

	if ((typeof recursive) !== "number")
	{
		args = [ recursive ].concat(args);
		recursive = Infinity;
	}

	for (const file of files)
	{
		if (file === "index.js")
			continue;

		const filePath = join(dir, file)
			, stat = fs.statSync(filePath);

		if (stat.isDirectory())
		{
			// 'recursive' here stands for the the amount of dirs we should travel and is controlled by decreasing with every directory call
			if (recursive === 0)
				continue;

			modules[file] = global.index(filePath, recursive - 1, ...args);
			continue;
		}

		if (args.length)
			modules[file.replace(".js", "")] = new (require(filePath))(...args);
		else
			modules[file.replace(".js", "")] = require(filePath);
	}

	return modules;
};

const { join } = require("path");

module.exports = {
	commands: index(join(__dirname, "src", "commands")),
	CronJob: require("./src/classes/CronJob.js"),
	DiscordEvent: require("./src/classes/DiscordEvent.js"),
	DiscordCommand: require("./src/classes/DiscordCommand.js")
};
