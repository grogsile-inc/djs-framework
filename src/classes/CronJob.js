let Job;
try
{
	// Try to require the optional dependency
	Job = require("cron").CronJob;
}
catch (error)
{
	// Discard error
}

class CronJob
{
	get CRON_OPTIONS_DEFAULT()
	{
		return {
			cronTime: null,
			onTick: this.job,
			context: this,
			start: true,
			runOnInit: false
		};
	}

	constructor(client, cronOptions = {})
	{
		if (Job == null)
			throw new Error("'cron' is not installed. Install it via 'npm install cron'.");

		if (this.constructor === CronJob)
			throw new Error(`AbstractError: '${this.constructor.name}' may not be instantiated directly.`);

		if (cronOptions?.cronTime == null)
			throw new Error("You must specify the 'cronTime' property with your CronJob.");

		this.client = client;
		this.job = new Job(Object.assign(this.CRON_OPTIONS_DEFAULT, cronOptions));
	}

	run()
	{
		throw new Error(`NotImplementedError: ${this.constructor.name} (${Object.getPrototypeOf(this.constructor).name}) must implement a 'run' method.`);
	}
}

module.exports = CronJob;
