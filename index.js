function index(dir, recursive = Infinity, ...args)
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

			modules[file] = index(filePath, recursive - 1, ...args);
			continue;
		}

		if (![ "js", "mjs", "json" ].some(ext => file.toLowerCase().endsWith(ext)))
			continue;

		if (args.length)
			modules[file.replace(".js", "")] = new (require(filePath))(...args);
		else
			modules[file.replace(".js", "")] = require(filePath);
	}

	return modules;
}

const { join } = require("path")
	, { Constants } = require("discord.js")
	, __src = join(__dirname, "src");

let classes = index(join(__src, "classes"), 0);
Object.assign(classes, index(join(__src, "classes", "database")));
Object.assign(classes, index(join(__src, "classes", "handlers")));

async function init(client, clientId = null, token = null)
{
	const { BaseHandler, SlashCommand } = classes;
	function updateApplicationCommands(clientId, token)
	{
		const { REST } = require("@discordjs/rest")
			, { Routes } = require("discord-api-types/v9");

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

			clientId = clientId || process.env.DISCORD_ID;
			let route = Routes.applicationCommands(clientId);

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

	// TODO: Currently only works correctly if called after the `<Client>.ready` event was received
	// or if 'process.env.DISCORD_ID' is declared
	await updateApplicationCommands(clientId || client.user?.id, token);

	client.on("interactionCreate", async interaction =>
	{
		for (const handler of BaseHandler.handlers)
		{
			// Comparing booleans is around 86% faster than using `instanceof` to check class
			if (!(handler.customId === interaction.customId
				&& handler.interactionType === Constants.InteractionTypes.MESSAGE_COMPONENT
				&& interaction.isMessageComponent()))
				continue;

			handler.handle(interaction);
		}

		if (interaction.isCommand())
		{
			// Find the command that corresponds with the interaction
			const command = SlashCommand.commands.find(c => c.id === interaction.commandId);

			// This should never happen, but include this in case does.
			// TODO: This does happen in the case of duplicate guild commands
			if (command == null)
				return console.warn(`A Slash Command (${interaction.commandName}) was executed, but no corresponding SlashCommand instance was found.`);

			try
			{
				// Run the command
				await command.run(interaction);
			}
			catch (err)
			{
				console.error(err);
			}
		}
	});
}

let commands = index(join(__src, "commands"));
module.exports = Object.assign({}, classes, { commands }, { init });
