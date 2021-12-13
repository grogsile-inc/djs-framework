const fs = require("fs-extra")
	, { resolve } = require("path")
	, Cache = require("node-cache")
	, assign = require("assign-deep");

class LocalFileDataManager
{
	static #dataPath = null;
	static get dataPath()
	{
		return LocalFileDataManager.#dataPath || resolve(process.cwd(), "data");
	}
	static set dataPath(val)
	{
		if ((typeof val) !== "string")
			throw new TypeError("Value for 'dataPath' must be a String.");

		LocalFileDataManager.#dataPath = val;
	}

	_internallySave(key, value)
	{
		const filePath = resolve(this.path, `${key}.json`);
		return new Promise((resolve, reject) =>
		{
			if (value instanceof this.config.Model)
				value = value.toJSON();

			// Read the existing file and deep-assign the supplied 'value' to it
			fs.readJSON(filePath)
				.then(data =>
				{
					assign(data, value);
					fs.outputJSON(filePath, data)
						.then(resolve)
						.catch(reject);
				})
				.catch(error =>
				{
					if (error.code !== "ENOENT")
						return reject(error);

					// The file doesn't exist yet, so skip trying to overrwrite data and just save 'value'
					fs.outputJSON(filePath, value)
						.then(resolve)
						.catch(reject);
				});
		});
	}

	get path()
	{
		return this.config.path || resolve(LocalFileDataManager.dataPath, this.config.name);
	}

	constructor(config)
	{
		this.config = config;

		this.cache = new Cache({
			config: Object.assign({
				sdtTTL: 60 * 10, // 10 mins
				checkPeriod: 60 * 10, // 10 mins
				useClones: false,
				deleteOnExpire: true
			}, config.cache)
		});

		this.cache.on("expired", this._internallySave.bind(this));
	}

	get(key)
	{
		let value = this.cache.get(key);
		if (value != null)
			return Promise.resolve(value);

		return new Promise((resolve, reject) =>
		{
			fs.readJSON(resolve(this.path, `${key}.json`))
				.then(data =>
				{
					value = data;
					if (this.config.Model)
						value = new this.config.Model(key, value);

					this.cache.set(key, value);
					resolve(value);
				}).catch(reject);
		});
	}

	add(key, value) { return this.update(key, value); }
	update(key, value)
	{
		if (key instanceof this.config.Model)
		{
			value = key;
			key = value.id || value.key;
		}

		this.cache.set(key, value);
		return this._internallySave(key, value);
	}

	delete(key)
	{
		if (key instanceof this.config.Model)
			key = key.id || key.key;

		this.cache.del(key);
		return fs.remove(resolve(this.path, `${key}.json`));
	}
}

module.exports = LocalFileDataManager;
