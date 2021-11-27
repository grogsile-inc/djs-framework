const { REST } = require("@discordjs/rest")
	, { Routes } = require("discord-api-types/v9")
	, { Client } = require("discord.js");

/**
 * @typedef {Object} InteractionData
 * @typedef {string} name
 * @typedef {string} description
 * @typedef {Array<ApplicationCommandOption>} [options]
 * @typedef {bool} [default_permissions]
 * @typedef {ApplicationCommandType} [type]
 */

/**
 * @typedef {ApplicationCommandData} CommandMeta
 * @property {InteractionData} interaction - The data that defines this command's Slash Command. If this is not present, the Slash Command is not updated.
 * @property {bool} system - Is this command module a system module? Users cannot execute system modules.
 * @property {number} permission - The permission level of this command.
 * @property {string} example - An example of how this command could be used, excluding the prefix & command name.
 */

class DiscordCommand
{
	static client;
	static commands = [];
	static #listener = null;

	static updateInteractions(clientId, token, testGuildId)
	{
		if (!(DiscordCommand.client instanceof Client))
			return Promise.reject(new Error("At least 1 instance of DiscordCommand must exist before calling this function."));

		clientId = DiscordCommand.client?.user?.id || clientId;
		if ((typeof clientId) !== "string")
			return Promise.reject(new Error("You must provide a valid 'clientId'."));

		return new Promise((resolve, reject) =>
		{
			const rest = new REST({ version: "9" }).setToken(token || DiscordCommand.client.token || process.env.DISCORD_TOKEN);

			const data = [];
			for (const cmd of Object.values(DiscordCommand.commands))
			{
				if (!cmd.meta.disableCommandUpdate && cmd.meta.interaction != null)
					data.push(Object.assign({
						name: cmd.name,
						description: cmd.description
					}, cmd.meta.interaction));
			}

			let route = Routes.applicationCommands(clientId);
			if (process.env.NODE_ENV.includes("dev") && (typeof testGuildId) === "string")
				route = Routes.applicationGuildCommands(clientId, testGuildId);

			rest.put(route, { body: data })
				.then(commands =>
				{
					for (const appCmd of commands)
					{
						const index = DiscordCommand.commands.findIndex(c => appCmd.name === c.meta?.interaction?.name || c.constructor.name || c.meta?.name || c.name)
							, cmd = DiscordCommand.commands[index];

						cmd.interaction = appCmd;

						DiscordCommand.commands[index] = cmd;
					}

					resolve(commands);
				}).catch(reject);
		});
	}

	get id()
	{
		return this.interaction?.id;
	}

	get embed()
	{
		const embed = new this.client.utils.DefaultEmbed()
			.setAuthor(this.name)
			.setDescription(`${this.description}\n*Also known as: \`${this.alias.join("`, `")}\`*.`)
			.addField("Permission Value", this.permission);

		if (this.example)
			embed.addField("Example Usage", `\`${this.client.prefix}${this.name} ${this.example}\``);

		return embed;
	}

	/**
	 * @param {DiscordClient} client - The client
	 * @param {CommandMeta} meta - The meta
	 */
	constructor(client, meta)
	{
		DiscordCommand.client = client;
		DiscordCommand.commands.push(this);

		if (DiscordCommand.#listener == null)
		{
			DiscordCommand.#listener = client.on("interactionCreate", interaction =>
			{
				if (!interaction.isCommand())
					return;

				// Find the command that corresponds with the interaction
				const command = DiscordCommand.commands.find(c => c.id === interaction.commandId);

				// This should never happen, but include this if it does.
				if (command == null)
					return console.warn(`A Slash Command (${interaction.commandName}) was executed, but no corresponding DiscordCommand instance was found.`);

				// Run the command
				command.run(interaction)
					.catch(console.error);
			});
		}

		this.client = client;
		this.meta = meta;

		/**
		 * @type {bool}
		 * Is this command module a system module? Users cannot execute system modules.
		 */
		this.system = meta.system;

		/**
		 * @type {string}
		 * The name of this command.
		 */
		this.name = meta.name;

		/**
		 * @type {string}
		 * A brief description of what this command does.
		 */
		this.description = meta.description;

		/**
		 * @type {string}
		 * An example of how this command could be used, excluding the prefix & command name.
		 */
		this.example = meta.example;

		if (this.meta.interaction == null)
			this.meta.interaction = {};

		if ((typeof this.meta.interaction.name) !== "string")
			this.meta.interaction.name = this.name || this.constructor.name;

		if ((typeof this.meta.interaction.description) !== "string")
			this.meta.interaction.description = this.description || this.constructor.name || "Command";
	}

	run(interaction)
	{
		throw new Error(`NotImplementedError: ${this.constructor.name} (${Object.getPrototypeOf(this.constructor).name}) must implement a 'run' method.`);
	}
}

module.exports = DiscordCommand;
