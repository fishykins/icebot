const Discord = require("discord.js");
const Snooper = require("./snooper.js").Snooper;

class Client {
    constructor(botToken, channelId, prefix, logger) {
        this.logger = logger;
        this.discord = new Discord.Client();
        this.channel = null;
        this.botToken = botToken;
        this.channelId = channelId;
        this.prefix = prefix;
        this.snooper = new Snooper();
    }

    connect(onConnected, onMessage, onMessageSpy) {
        this.discord.login(this.botToken);

        this.discord.once('ready', () => {
            this.logger.setDiscordUser(this.discord.user);
            this.channel = this.discord.channels.cache.get(this.channelId);
            this.logger.addDiscordChat(this.channel);
            onConnected();
        });

        this.discord.on("message", message => {
            const channel = this.discord.channels.cache.get(this.channelId);
            if (!message.author.bot) {
                if (message.channel == channel) {
                    var args = message.content.toLowerCase().split(" ");
                    if (args[0] == this.prefix && args.length >= 2) {
                        this.logger.log("passing api call '" + message + "' to bot...");
                        onMessage(args.slice(1));
                    } else {
                        this.logger.log("passing message '" + message + "' to bot...");
                        onMessageSpy(message.content);
                    }
                } else {
                    this.snooper.evaluateMessage(message);
                }

            }
        });
    }

    destroy() {
        if (this.discord) {
            this.discord.destroy();
        }
    }

    send(message) {

    }
}

module.exports = {
    Client
};