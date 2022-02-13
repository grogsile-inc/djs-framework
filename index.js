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
	SlashCommand: require(join(src, "classes", "SlashCommand.js")),
	DiscordEvent: require(join(src, "classes", "DiscordEvent.js")),
	commands: index(join(src, "commands"))
};
async function init(client)
{
	function updateApplicationCommands(clientId, token, testGuildId)
	{
		const { REST } = require("@discordjs/rest")
			, { Routes } = require("discord-api-types/v9")
			, { SlashCommand } = modules;

		if ((typeof clientId) !== "string")
			return Promise.reject(new Error("You must provide a valid 'clientId'."));

		return new Promise((resolve, reject) =>
		{
			const rest = new REST({ version: "9" }).setToken(token || process.env.DISCORD_TOKEN);

			const data = [];
			for (const cmd of Object.values(SlashCommand.commands))
			{
				if (!cmd.meta?.disableCommandUpdate && cmd.meta?.interaction != null)
					data.push(cmd.meta.interaction);
			}

			let route = Routes.applicationCommands(clientId);
			if (process.env.NODE_ENV?.includes("dev") && (typeof testGuildId) === "string")
				route = Routes.applicationGuildCommands(clientId, testGuildId);

			rest.put(route, { body: data })
				.then(commands =>
				{
					for (const appCmd of commands)
					{
						const index = SlashCommand.commands.findIndex(c => appCmd.name === (c.meta?.interaction?.name || c.name || c.meta?.name || c.constructor.name.toLowerCase()))
							, cmd = SlashCommand.commands[index];

						cmd.interaction = appCmd;
						SlashCommand.commands[index] = cmd;
					}

					resolve(commands);
				}).catch(reject);
		});
	}

	// TODO: Currently only works if called after the `<Client>.ready` event was received  
	await updateApplicationCommands(client.user?.id);
}
