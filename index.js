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

const { join } = require("path")
	, src = join(__dirname, "src");

module.exports = {
	CronJob: require(join(src, "classes", "CronJob.js")),
	DiscordCommand: require(join(src, "classes", "DiscordCommand.js")),
	DiscordEvent: require(join(src, "classes", "DiscordEvent.js")),
	commands: index(join(src, "commands"))
};
