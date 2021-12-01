const { REST } = require("@discordjs/rest")
	, { Routes } = require("discord-api-types/v9")
	, { MessageEmbed } = require("discord.js");

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
		clientId = DiscordCommand.client?.user?.id || clientId;
		if ((typeof clientId) !== "string")
			return Promise.reject(new Error("You must provide a valid 'clientId'."));

		return new Promise((resolve, reject) =>
		{
			const rest = new REST({ version: "9" }).setToken(token || DiscordCommand.client.token || process.env.DISCORD_TOKEN);

			const data = [];
			for (const cmd of Object.values(DiscordCommand.commands))
			{
				if (!cmd.meta?.disableCommandUpdate && cmd.meta?.interaction != null)
					data.push(cmd.meta.interaction);
			}

			let route = Routes.applicationCommands(clientId);
			if (process.env.NODE_ENV.includes("dev") && (typeof testGuildId) === "string")
				route = Routes.applicationGuildCommands(clientId, testGuildId);

			rest.put(route, { body: data })
				.then(commands =>
				{
					for (const appCmd of commands)
					{
						const index = DiscordCommand.commands.findIndex(c => appCmd.name === (c.meta?.interaction?.name || c.name || c.meta?.name || c.constructor.name.toLowerCase()))
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
		const embed = new MessageEmbed()
			.setAuthor(this.name)
			.setDescription(this.description);

		if (this.interaction?.options?.length)
		{
			for (const option of this.interaction.options.slice(0, 24))
				embed.addField(`${option.name}${option.required ? "*" : ""}`, `${option.description}${option.choices?.length ? (`\nAvailable choices: \`${option.choices.map(c => c.name).join("`, `")}\``) : ""}`);
		}

		if (this.example)
			embed.addField("Example Usage", `\`\`\`/${this.name} ${this.example}\`\`\``);

		return embed;
	}

	/**
	 * @param {DiscordClient} client - The client
	 * @param {CommandMeta} meta - The meta
	 */
	constructor(client, meta)
	{
		if (this.constructor === DiscordCommand)
			throw new Error(`AbstractError: '${this.constructor.name}' may not be instantiated directly.`);

		DiscordCommand.client = client;
		DiscordCommand.commands.push(this);

		if (DiscordCommand.#listener == null)
		{
			DiscordCommand.#listener = client.on("interactionCreate", async interaction =>
			{
				if (!interaction.isCommand())
					return;

				// Find the command that corresponds with the interaction
				const command = DiscordCommand.commands.find(c => c.id === interaction.commandId);

				// This should never happen, but include this in case does.
				// TODO: This does happen in the case of duplicate guild commands
				if (command == null)
					return console.warn(`A Slash Command (${interaction.commandName}) was executed, but no corresponding DiscordCommand instance was found.`);

				try
				{
					// TODO: Review this. I don't know what the implications are of using await with a normal function.

					// Run the command
					await command.run(interaction);
				}
				catch (err)
				{
					console.error(err);
				}
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
