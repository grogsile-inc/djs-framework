const { DiscordEvent } = require("@medallyon/djs-framework");

// Create a middleware function for an event
function log({ author, content })
{
	console.log(`${author.username}: "${content}"`);
	// Prints: Medallyon: "There is no way a bee should be able to fly."
}

// Then, create a new DiscordEvent instance and supply the Event Name, the Client, and any Options
new DiscordEvent("messageCreate", client, { middleware: [ log ] });

/**************
	   OR
 **************/

// Create your DiscordEvent instance and store it
const onMessageCreate = new DiscordEvent("messageCreate", client);

// And register any middleware after creating your DiscordEvent
onMessageCreate.registerMiddleware(log);
