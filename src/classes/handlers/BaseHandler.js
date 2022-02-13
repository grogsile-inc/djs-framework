class BaseHandler
{
	static handlers = [];
	interactionType = null;

	constructor()
	{
		if (this.constructor === BaseHandler)
			throw new Error(`AbstractError: '${this.constructor.name}' may not be instantiated directly.`);

		BaseHandler.handlers.push(this);
	}
}

module.exports = BaseHandler;
