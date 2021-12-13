/**
 * A Model should be self-sufficient - you should be able to pass a Model class into the Model constructor and make an exact copy of the Model instance that was passed in.
 * @class Model
 */
class Model
{
	/**
	 * The ID or Key for this Data Object.
	 * @type {Snowflake}
	 */
	get id()
	{
		return this._id;
	}
	set id(val)
	{
		this._id = val;
		this._data.id = this._id;
	}

	/**
	 * @param {string|number} id
	 * @param {Model|Object} [data={}]
	 */
	constructor(id, data = {})
	{
		if (new.target === Model)
			throw new Error(`AbstractError: ${this.constructor.name} may not be instantiated directly.`);

		this._id = id;
		this._data = data;

		this._data.id = this.id;
	}

	/**
	 * Returns a JSON-compatible representation of the object.
	 * @return {Object} JSON-compatible representation of the object.
	 */
	toJSON()
	{
		return this._data;
	}
}

module.exports = Model;
