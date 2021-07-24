const Discord = require("discord.js");
const Snooper = require("./snooper.js").Snooper;
const FarmIcon = "https://static.wikia.nocookie.net/play-rust/images/8/86/Pick_Axe_icon.png/revision/latest/top-crop/width/360/height/360?cb=20151106061323";
const PvpIcon = "https://static.wikia.nocookie.net/play-rust/images/d/d1/Assault_Rifle_icon.png/revision/latest/scale-to-width-down/250?cb=20160211200609";

class Client {
    constructor(config, bot) {
        this.logger = bot.logger;
        this.discord = new Discord.Client();
        this.channel = null;
        this.botToken = config.botToken;
        this.channelId = config.channelId;
        this.prefix = config.preffix;
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
                    if (this.prefix.length > 1) {
                        //Prefix is a long string
                        var args = message.content.split(" ");
                        if (args[0].toLowerCase() == this.prefix && args.length >= 2) {
                            this.logger.log("passing api call '" + message + "' to bot...");
                            onMessage(args.slice(1), message.author);
                        } else {
                            this.logger.log("passing message '" + message + "' to bot...");
                            onMessageSpy(message.content);
                        }
                    } else {
                        //Prefix is a single char
                        const firstChar = message.content.charAt(0);
                        var args = message.content.slice(1).split(" ");
                        if (firstChar.toLowerCase() == this.prefix && args.length >= 1) {
                            this.logger.log("passing api call '" + message + "' to bot...");
                            onMessage(args, message.author);
                        } else {
                            this.logger.log("passing message '" + message + "' to bot...");
                            onMessageSpy(message.content);
                        }
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

    formatPlayerStats(player) {
        var embeded = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(player.name)
            .setDescription(player.steamid)
            .setThumbnail(FarmIcon);

        this.embedAddStatType(player, embeded, "farm");
        this.embedAddStatType(player, embeded, "pvp");
        this.embedAddStatType(player, embeded, "misc");
        embeded.setTimestamp();
        return embeded;
    }

    embedAddStatType(player, embed, filter) {
        player.stats.forEach(stat => {
            if (stat.type.toLowerCase() == filter.toLowerCase()) {
                const farmed = stat.value - stat.wipeValue;
                embed.addField(stat.name, farmed, true);
            }
        });
    }
}

module.exports = {
    Client
};