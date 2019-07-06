const tmi = require('tmi.js');
const CommandHelper = require('./js/commands.js');
const bot = require('./js/chatbot.js');
const fs = require("fs");

// Define configuration options
var opts = fs.readFileSync("json/auth.json");
opts = JSON.parse(opts);

const client = new tmi.client(opts);
const ChatBot = new bot(client);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(channel, context, msg, self) {
    if (self || ChatBot.stop[channel]) {
        return;
    } // Ignore messages from the bot

    var command = ChatBot.commandRe.exec(msg);
    var levelCode = ChatBot.getLevelCode(msg);

    if (command) {
        const commandName = command[0].trim();
        if (ChatBot.commands[command]) {
            var commandIndex = ChatBot.commands[command].name

            const cHelper = new CommandHelper(client, ChatBot);

            if (cHelper[commandIndex]) {
                cHelper[commandIndex](channel, context, msg, self)
            }
        } else {
            client.say(channel, `The command ${commandName} does not exist`);
        }
    } else {
        if (levelCode) {
            ChatBot.addLevelCode(levelCode, context);
            client.say(channel, `Thanks for submitting your level, ${context['display-name']}. ${levelCode[0]} was added to the queue.`);
        }
    }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}