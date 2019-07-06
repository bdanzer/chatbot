const fs = require("fs");

class ChatBot {
    constructor(client) {
        this.levels = {};

        var jokes = fs.readFileSync("json/jokes.json");
        var commands = fs.readFileSync("json/commands.json");

        this.jokes = JSON.parse(jokes);
        this.commands = JSON.parse(commands);
        
        this.currentUser;
        this.nextUser;
        this.stop = {};
        this.levelRe = new RegExp('(?:[a-zA-Z\\d]{3}-[a-zA-Z\\d]{3}-[a-zA-Z\\d]{3})');
        this.commandRe = new RegExp('![a-z]+');
        this.noLevelMsg = 'Sorry there are currently no levels added yet. To add a level use the !add command followed by the level code in this format: xxx-xxx-xxx (!add xxx-xxx-xxx).'
        
        client.on("part", (channel, username, self) => {
            if (self || this.stop[channel]) {
                return;
            } // Ignore messages from the bot

            if (this.isInQueue(username)) {
                this.remove_level(username);
                client.say(channel, `${username} just left and level has been removed from queue. If this is an error please let me know.`);
            }
        });

        client.on("join", (channel, username, self) => {
            console.log(channel);
            if (self) {
                client.say(channel, `${username} MrDestructoid has joined to help with your mario maker level queue. You can use !stop to stop this bot. For a list of commands use !commands.`);
                // client.say(channel, `${username} has become more powerful with an upgrade DarkMode. Please add your levels again.`);
            }
        });
    }

    addLevelCode(levelCode, context) {
        this.levels[context.username] = levelCode[0]
    }

    getRandomJoke() {
        const count = this.jokes.length
        const jokeIndex = Math.floor(Math.random() * count)
        return this.jokes[jokeIndex];
    }
    
    getLevelCode(msg) {
        return this.levelCode = msg.match(this.levelRe);
    }
    
    remove_level(username) {
        delete this.levels[username];
    }
    
    isMod(context) {
        return (context.badges.broadcaster);
    }
    
    isInQueue(username) {
        return this.levels[username];
    }
    
    hasLevels() {
        return Object.entries(this.levels).length !== 0 && this.levels.constructor === Object
    }
    
    getLevelCount() {
        return Object.entries(this.levels).length
    }
}

module.exports = ChatBot;