class DiscordEvent
{
	static #registeredEvents = new Map();

	static get #OPTIONS_DEFAULT()
	{
		return {
			on: "on",
			middleware: []
		};
	}

	constructor(eventName, client, options = DiscordEvent.#OPTIONS_DEFAULT)
	{
		// Overwrite this event listener with this new class if it already exists
		if (DiscordEvent.#registeredEvents.has(eventName))
			DiscordEvent.#registeredEvents.get(eventName).destroy();

		// Store this event listener
		DiscordEvent.#registeredEvents.set(eventName, this);

		this.name = eventName;
		this.client = client;

		{ // Validate options
			const defaults = DiscordEvent.#OPTIONS_DEFAULT;

			this.on = [ "on", "once" ].some(x => x === options.on?.toLowerCase())
				? options.on?.toLowerCase()
				: defaults.on;

			this.middleware = (Array.isArray(options.middleware) ? options.middleware : defaults.middleware)
				.filter(x => (typeof x) === "function");
		}

		// Setup the event listener
		this.client[this.on](this.name, this.trigger.bind(this));
	}

	registerMiddleware(cb)
	{
		if ((typeof cb) !== "function")
			throw new TypeError("The parameter you provided is not a function.");

		this.middleware.push(cb);
	}

	trigger(...args)
	{
		for (const middle of this.middleware)
		{
			try
			{
				middle.call(this.client, ...args);
			}

			catch (err)
			{
				console.error(err);
			}
		}
	}

	destroy()
	{
		DiscordEvent.#registeredEvents.delete(this.name);
		this.client.removeAllListeners(this.name);
		this.middleware = null;
		this.client = null;
	}
}

module.exports = DiscordEvent;
