const { MessageEmbed } = require("discord.js");

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

class SlashCommand
{
	static commands = [];

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
		if (this.constructor === SlashCommand)
			throw new Error(`AbstractError: '${this.constructor.name}' may not be instantiated directly.`);

		SlashCommand.commands.push(this);

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

module.exports = SlashCommand;
