const playerConfigFile = "./config/players.json";
const PlayerConfig = require("../config/players.json");
const SteamConfig = require("../config/steam.json");
const Player = require("./player.js").Player;
const fs = require('fs');

var methods = [{
        "name": "help",
        "description": "Lists all possible commands",
        "function": help,
        "spellings": ["hlp", "hep", "h", "-h"]
    },
    {
        "name": "device",
        "description": "command for handling device calls",
        "function": device,
        "spellings": ["devices", "dvices", "dev"]
    },
    {
        "name": "debug",
        "description": "Enables/disables debuging messages on discord.",
        "function": debug,
        "hidden": true
    },
    {
        "name": "server",
        "description": "Gets server infomation, including usefull runtime data",
        "function": serverInfo,
        "spellings": ["srv", "serverinfo", "srver", "rustpluss", "rustplus", "rust+"]
    },
    {
        "name": "connect",
        "description": "Attempts to connect to rust+ app, refreshing the connection if it is dead.",
        "function": connect
    },
    {
        "name": "disconnect",
        "description": "Disconnects the rust+ app.",
        "function": disconnect
    },
    {
        "name": "autoconnect",
        "description": "variable to control auto connection.",
        "function": autoConnect
    },
    {
        "name": "quit",
        "description": "Kill the bot.",
        "function": quit,
        "spellings": ["exit", "kill", "stop"],
        "hidden": true
    },
    {
        "name": "about",
        "description": "Development and useful links",
        "function": git,
        "spellings": ["info", "github", "git", "development"]
    },
    {
        "name": "players",
        "description": "Player database management",
        "function": player,
        "spellings": ["playr", "plyer", "player"]
    },
    {
        "name": "stats",
        "description": "Player stats",
        "function": stats,
        "spellings": ["sts", "stat"]
    }
]

function help(bot, _, _) {
    var txt = "**All commands**\n";
    methods.forEach(e => {
        if (!e.hidden) {
            txt = txt + "*" + e.name + "* - " + e.description + "\n";
        }
    });
    bot.logger.send(txt);
}

function player(bot, args, author) {
    bot.handlePlayers(args, author);
}

function stats(bot, args, author) {
    bot.stats(args, author);
}

function device(bot, args, _) {
    bot.handleDevices(args);
}

function debug(bot, args, _) {
    if (args[0].toLowerCase() == "true") {
        bot.logger.debuging = true;
        bot.logger.send("Debugging set to TRUE");
    } else if (args[0].toLowerCase() == "false") {
        bot.logger.debuging = false;
        bot.logger.send("Debugging set to FALSE");
    } else {
        bot.logger.send("Debugging: **" + logger.debuging + "**");
    }
}

function autoConnect(bot, args, _) {
    if (args[0].toLowerCase() == "true") {
        bot.server.autoReconnect = true;
        bot.logger.send("autoConnect set to **TRUE**");
    } else if (args[0].toLowerCase() == "false") {
        bot.server.autoReconnect = false;
        bot.logger.send("autoConnect set to **FALSE**");
    } else {
        bot.logger.send("autoConnect: **" + server.autoReconnect + "**");
    }
}

function serverInfo(bot, args, _) {
    if (args.length <= 0) {
        bot.server.getInfo();
        return;
    }
    switch (args[0].toLowerCase()) {
        case "pop":
        case "players":
            bot.server.getPlayerCount();
            break;
        default:
            bot.server.getInfo();
            break;
    }

}

function connect(bot, _, _) {
    bot.server.connect();
}

function disconnect(bot, _, _) {
    bot.server.disconnect();
}

function quit(bot, _, _) {
    bot.logger.send("Good night, dont let the offliners bite!");
    //await new Promise(r => setTimeout(r, 2000));
    bot.server.destroy();
    bot.client.destroy();
    bot.steam = null;
    bot.server = null;
    bot.client = null;
    bot.logger = null;
}

function git(bot, _, _) {
    bot.logger.send("This project was developed by Fishy#3400 for use by ICE. \nhttps://github1s.com/fishykins/icebot");
}

module.exports = {
    methods
};