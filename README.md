# djs-bot-framework
This framework wraps around the Discord.js package to make creating a bot with Slash Commands as easy as possible. The main purpose is to remove the strain of trying to figure out how to use Slash Commands.

## Getting Started
Before using any of the examples below, we need to create a Discord.js Client instance, as per the [documentation](https://discord.js.org/#/docs/main/stable/general/welcome):

```js
const { Client, Intents, Constants } = require("discord.js");

// Create the client
const client = new Client({
    // Don't forget your Intents
    intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES ]
});
```

### Discord Events
Setup event listeners and pass in middleware functions. See [discord.js#Client](https://discord.js.org/#/docs/main/stable/class/Client) for a list of events and their arguments.

To setup an event listener for, say, the `messageCreate` event:
```js
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
```

**Note** that the `messageCreate` event will become a privileged intent starting [April 30, 2022](https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Privileged-Intent-for-Verified-Bots).

**Note** that events with the same name will be de-duplicated and destroyed.

### Slash Commands
You can easily create slash commands with this framework. Here is an example:

```js
// Create a class that inherits DiscordCommand for your chosen Command
class Ping extends DiscordCommand
{
    constructor(client)
    {
        super(client, {
            name: "ping",
            description: "Pong!",

            // The 'interaction' property defines your Slash Command
            interaction: {
                options: [
                    {
                        type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
                        name: "pong",
                        description: "Pong?",
                        required: false
                    }
                ]
            }
        });
    }

    // The 'run' method is always required
    async run(interaction)
    {
        // The bot responds with "Pong!" or "Ping?..." based on if the user supplied the 'pong' option
        const pong = interaction.options.getBoolean("pong") ? "Ping?..." : "Pong!";
        await interaction.reply({ content: pong });
    }
}

// Create an instance of your custom Command
new Ping(client);
```

Once you're happy with your Command modules, call `DiscordEvent.updateInteractions`:
```js
// Call this to update your Slash Commands after you have declared all of your custom Commands
DiscordCommand.updateInteractions(process.env.DISCORD_BOT_ID, process.env.DISCORD_TOKEN);
```

## API

### `DiscordEvent`
The constructor for `DiscordEvent` takes 3 arguments:

+ `eventName` | `<string>` - the Event Name to subscribe to. See [discord.js#Client](https://discord.js.org/#/docs/main/stable/class/Client) for a list of events.
+ `client` | `<Discord.Client>` - the Discord.js Client instance that you will use as the main client throughout your project
+ `options` | `<Object>` (optional)
  + `on` | `<string>` - a choice between `"on"` or `"once"`. Read up on what this means [here](https://nodejs.org/api/events.html#handling-events-only-once).
  + `middleware` | `<Array<function>>` - an array of middleware functions that should be executed when this event is triggered

#### Fields

+ `name` | `<string>` - the event name for this event listener
+ `client` | `<Discord.Client>` - the Discord.js Client
+ `on` | `<string>` - the method of subscription to this event
+ `middleware` | `<Array<function>>` - the Array of middleware functions that are run when this event is triggered

#### Methods

##### `registerMiddleware`
This method adds a function to the list of middleware functions that are executed when the event for a particular event listener is triggered. It takes 1 argument:

+ `cb` | `<function>` - the middleware callback function for this event. Any arguments are passed into the function depending on the type of event.

##### `destroy`
This method destroys this event listener. It takes no arguments.

### `DiscordCommand`
The constructor for `DiscordCommand` takes 2 arguments:

+ `client` | `<Discord.Client>` - the Discord.js Client
+ `meta` | `<Object>` - info associated with this Command
  + `name` | `<string>` - the name of the command
  + `description` | `<string>` - a description for this command
  + `interaction` | `<Object>` - an [Application Command Object](https://discord.com/developers/docs/interactions/application-commands#create-global-application-command)
  + `system` (optional) - whether this is a system-only command. If `true` | `<bool>`, this command will not be added as a Slash Command.
  + `example` | `<string>` (optional) - an example string of how this command might be used

## Contributing
Please submit issues if you find a bug, have some valuable feedback or feature requests, or if you have a question. Feel free to create a pull request if you would like to directly contribute to the project!
