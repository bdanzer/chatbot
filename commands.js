class CommandHelper {
    constructor(client, chatbot) {
        this.client = client
        this.ChatBot = chatbot

        this.nextuser = Object.keys(chatbot.levels)[1];
        this.currentUser = Object.keys(chatbot.levels)[0];
    }

    rollDice() {
        const sides = 6;
        return Math.floor(Math.random() * sides) + 1;
    }

    dice(channel, context, msg, self) {
        const num = this.rollDice();
        this.client.say(channel, `You rolled a ${num}`);
    }

    die(channel, context, msg, self) {
        this.client.say(channel, `You ok ${context.username}?`);
    }

    add(channel, context, msg, self) {
        if (this.ChatBot.levelCode) {
            this.ChatBot.addLevelCode(this.ChatBot.levelCode, context);
            var currentLevelPosition = this.ChatBot.getLevelCount();
            this.client.say(channel, `Thanks for submitting your level, ${context['display-name']}. ${this.ChatBot.levelCode[0]} was added to the queue.`);
        } else {
            this.client.say(channel, `Doesn't seem to be a valid level code ${context['display-name']}. Please use this format the level code like this xxx-xxx-xxx.`);
        }

        this.client.whisper(context.username, 'Your Level has been added')
            .then((data) => {
                console.log('sent', data)
            }).catch((err) => {
                console.log(err)
            });
    }

    list(channel, context, msg, self) {
        if (this.ChatBot.getLevelCount()) {
            var string = ``;
            var i = 1;
            console.log(this.ChatBot.levels);
            for (let username in this.ChatBot.levels) {
                if (i < 10) {
                    string += `${i}. ${username}: ${this.ChatBot.levels[username]} - `;
                    i++;
                } else {
                    break;
                }
            }

            this.client.say(channel, string);
        } else {
            this.client.say(channel, `There are no current levels.`);
        }
    }

    current(channel, context, msg, self) {
        if (this.currentUser) {
            this.client.say(channel, `Current level is ${this.ChatBot.levels[this.currentUser]} made by ${this.currentUser}`);
        } else {
            this.client.say(channel, `There are no current levels.`);
        }
    }

    joke(channel, context, msg, self) {
        var joke = this.ChatBot.getRandomJoke();
        this.client.say(channel, joke.Q);
        setTimeout(() => {
            this.client.say(channel, joke.A + ' LUL');
        }, 3000);
    }

    stop(channel, context, msg, self) {
        if (this.ChatBot.isMod(context)) {
            this.ChatBot.stop[channel] = context.username;
            this.client.say(channel, `BibleThump ok I'll leave`);
            return;
        } else {
            this.client.say(channel, `Only the broadcaster can use this command peon SMOrc.`);
        }
    }

    commands(channel, context, msg, self) {
        this.client.say(channel, `!add (to add levels), !current (to see current level being played), !next or !done (to move to next level and removes from queue), !list (list levels in queue), !queue or !position (tells user what position in line they are), !joke (on my off hours as a robot I tell jokes)`);
    }

    next(channel, context, msg, self) {
        if (this.nextuser) {
            this.client.say(channel, `The next level is: ${this.ChatBot.levels[this.nextuser]} by ${this.nextuser}. When you are done with your current level: ${this.ChatBot.levels[this.currentUser]} by ${this.currentUser} use !done.`);
        } else {
            this.client.say(channel, `There are no levels next.`);
        }
    }

    done(channel, context, msg, self) {
        this.skip(channel, context, msg, self);
    }

    skip(channel, context, msg, self) {
         /**
         * If it's not a broadcaster then don't continue
         */
        if (!this.ChatBot.isMod(context)) {
            this.client.say(channel, `Woah buddy you don't have those permissions, only the broadcaster does, but nice try LUL`);
            return;
        }

        if (this.nextuser) {
            this.client.say(channel, `Moving onto the next level ${this.ChatBot.levels[this.nextuser]} by ${this.nextuser}`);
        } else if (this.currentUser && !this.nextuser) {
            this.client.say(channel, `There are no more levels to move onto.`);
        }

        if (this.currentUser) {
            delete this.ChatBot.levels[this.currentUser];
        } else {
            this.client.say(channel, `There are no more levels to move onto.`);
        }
    }

    queue(channel, context, msg, self) {
        this.order(channel, context, msg, self)
    }

    position(channel, context, msg, self) {
        this.order(channel, context, msg, self)
    }

    order(channel, context, msg, self) {
        /**
         * If we even have levels then find the position
         */
        if (this.ChatBot.hasLevels()) {
            let position = 1;
            if (context.username in this.ChatBot.levels) {
                for (let username in this.ChatBot.levels) {
                    if (username === context.username) {
                        this.client.say(channel, `${context.username}, you are in position number ${position}. There are ${position - 1} levels ahead of you.`);
                        break;
                    }
                    position++;
                }
            } else {
                this.client.say(channel, `Looks like you don't have a level added yet. To add a level use this command: !add xxx-xxx-xxx.`);
            }
        /**
         * If we don't have levels then let them know.
         */
        } else {
            this.client.say(channel, `No levels in the queue yet. To add a level use this command: !add xxx-xxx-xxx.`);
        }
    }
}

module.exports = CommandHelper;