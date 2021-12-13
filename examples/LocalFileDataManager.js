const { LocalFileDataManager, Model, DiscordEvent } = require("@medallyon/djs-framework");

// Define a Model for the type of Data you want to store; for example:
class GuildModel extends Model
{
	constructor(guildData)
	{
		super(guildData.id, guildData);
	}
}

// Create a LocalFile Data Manager
// In this case, we're creating a manager for Guilds and supply it with a Data Model
const guildDB = new LocalFileDataManager({
	name: "guilds",
	Model: GuildModel
});

// We can hook up to the 'guildCreate' event and call the 'update' method on the DB with a key and value
new DiscordEvent("guildCreate", client, {
	middleware: [
		function saveGuildToFile(guild)
		{
			guildDB.update(guild.id, guild)
				.then(() => console.log("Successfully saved Guild with ID", guild.id))
				.catch(console.error);
		}
	]
});

// We can hook up to the 'guildDelete' event and call the 'delete' method on the DB with a key
new DiscordEvent("guildDelete", client, {
	middleware: [
		async function removeGuildFromFile(guild)
		{
			guildDB.delete(guild.id)
				.then(() => console.log("Successfully deleted Guild with ID", guild.id))
				.catch(console.error);
		}
	]
});
