// Includes
const Logger = require("./logger.js").Logger;
const Player = require("./player.js").Player;
const Server = require("./server.js").Server;
const Client = require("./client.js").Client;
const CLI = require("./cli.js");

// Configs
const DiscordConfig = require("../config/discord.json");
const ServerConfig = require("../config/server.json");
const PlayerConfig = require("../config/players.json");

// Handle configs
const serverPlayer = ServerConfig.playerTokens[0];
const hostPlayer = getHostPlayer();

// ==================================================================================================== //
// ==================================================================================================== //
// Main class
class IceBot {
    constructor() {
        this.client = null;
        this.server = null;
        this.logger = new Logger();
    }

    init() {
        this.initDiscord();
    }



    initDiscord() {
        this.client = new Client(DiscordConfig.botToken, DiscordConfig.channelId, DiscordConfig.preffix, this.logger);
        this.client.connect(this.clientReady.bind(this), this.apiCall.bind(this), this.touchMessage.bind(this));
        this.logger.send("starting client (discord) connection...");
    }

    initRust() {
        this.server = new Server(ServerConfig.ip, ServerConfig.port, hostPlayer, this.logger);
        this.server.connect(this.serverReady.bind(this));
        this.logger.send("starting server (rust+) connection...");
    }

    serverReady() {
        this.logger.sendBlock("server connected");
    }

    clientReady() {
        this.logger.sendBlock("client connected");
        this.initRust();
    }

    // Handles official calls to the api
    apiCall(args) {
        for (let i = 0; i < CLI.methods.length; i++) {
            const e = CLI.methods[i];
            if (e.name == args[0]) {
                args = args.slice(1);
                this.logger.log("Parsing '" + e.name + "' with args " + args);
                e.function(this.client, this.server, this.logger, args);
                return;
            } else if (e.spellings) {
                if (e.spellings.includes(args[0])) {
                    args = args.slice(1);
                    this.logger.log("Parsing '" + e.name + "' with args " + args);
                    e.function(this.client, this.server, this.logger, args);
                    return;
                }
            }
        }
    }

    // Takes in all messages that are not api calls. Good for snooping...
    touchMessage(message) {
        this.logger.log(message);
    }
}

// ==================================================================================================== //
// ==================================================================================================== //
// Misc functions
function getHostPlayer() {
    var tempHostPlayer = null;
    for (let j = 0; j < PlayerConfig.length; j++) {
        var tempPlayer = PlayerConfig[j];
        if (tempPlayer.steamId == serverPlayer.steamId) {
            j = PlayerConfig.length;
            tempHostPlayer = new Player(tempPlayer.name, tempPlayer.steamId, serverPlayer.token);
        }
    }
    return tempHostPlayer;
}

// ==================================================================================================== //
// ==================================================================================================== //
module.exports = {
    IceBot
};