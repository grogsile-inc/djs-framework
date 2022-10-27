const { MessageEmbed } = require("discord.js");

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
	 * @param {ApplicationCommandData} applicationCommand
	 */
	constructor(client, applicationCommand)
	{
		if (this.constructor === SlashCommand)
			throw new Error(`AbstractError: '${this.constructor.name}' may not be instantiated directly.`);

		SlashCommand.commands.push(this);

		this.client = client;
		this.meta = applicationCommand;

		/**
		 * @type {bool}
		 * Is this command module a system module? Users cannot execute system modules.
		 */
		this.system = this.meta.system;

		/**
		 * @type {string}
		 * The name of this command.
		 */
		this.name = this.meta.name;

		/**
		 * @type {string}
		 * A brief description of what this command does.
		 */
		this.description = this.meta.description;

		/**
		 * @type {string}
		 * An example of how this command could be used, excluding the prefix & command name.
		 */
		this.example = this.meta.example;

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
