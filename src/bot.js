// Includes
const Logger = require("./logger.js").Logger;
const Player = require("./player.js").Player;
const Server = require("./server.js").Server;
const Client = require("./client.js").Client;
const Steam = require("./steam.js").Steam;
const Chatter = require("./chatter.js").Chatter;
const CLI = require("./cli.js");
const fs = require("fs");

// Configs
const ServerConfig = require("../config/server.json");
const ClientConfig = require("../config/client.json");
const SteamConfig = require("../config/steam.json");
const PlayerConfig = require("../config/players.json")
const DeviceConfig = require("../config/devices.json");

const deviceConfigFile = "./config/devices.json"
const playerConfigFile = "./config/players.json"

// ==================================================================================================== //
// ==================================================================================================== //
// Main class
class IceBot {
    constructor() {
        this.client = null;
        this.server = null;
        this.steam = null;
        this.logger = new Logger();
        this.chatter = new Chatter(this.logger, ["tony", "trevor", "bot"]);
        this.players = PlayerConfig;
        this.devices = DeviceConfig;
    }

    init() {
        this.initDiscord()
        this.logger.send("Found " + this.players.length + " players and " + this.devices.length + " devices.");
    }

    initSteam() {
        this.steam = new Steam(SteamConfig, this);
        this.players.forEach(x => {
            this.steam.updatePlayerData(x);
        });
        this.savePlayers();
    }

    initDiscord() {
        this.client = new Client(ClientConfig, this);
        this.client.connect(this.clientReady.bind(this), this.apiCall.bind(this), this.touchMessage.bind(this));
        this.logger.send("starting client (discord) connection...");
    }

    initServer() {
        this.server = new Server(ServerConfig, this);
        this.server.connect(this.serverReady.bind(this));
        this.logger.send("starting server (rust+) connection...");
    }

    serverReady() {
        this.logger.sendBlock("server connected");
    }

    clientReady() {
        this.logger.sendBlock("client connected");
        this.initServer();
        this.initSteam();
    }

    // Handles official calls to the api
    apiCall(args, author) {
        for (let i = 0; i < CLI.methods.length; i++) {
            const e = CLI.methods[i];
            if (e.name == args[0].toLowerCase()) {
                args = args.slice(1);
                console.log("Parsing '" + e.name + "' with args " + args);
                e.function(this, args, author);
                return;
            } else if (e.spellings) {
                if (e.spellings.includes(args[0])) {
                    args = args.slice(1);
                    console.log("Parsing '" + e.name + "' with args " + args);
                    e.function(this, args, author);
                    return;
                }
            }
        }
    }

    // Takes in all messages that are not api calls. Good for snooping...
    touchMessage(message) {
        this.chatter.chat(message);
    }

    async stats(args, author) {
        if (args.length < 1) {
            this.logger.send("Either provide a player or stat name (use **list** to get a list of all stats)");
            return;
        }

        if (args[0].toLowerCase() == "wipe") {
            this.wipePlayerStats(author);
            return;
        }

        if (args[0].toLowerCase() == "list") {
            var txt = "";
            this.steam.stats.forEach(x => {
                txt += x + "\n";
            });
            this.logger.sendBlock(txt, "Available Stats");
            return;
        }

        if (this.steam.stats.includes(args[0].toLowerCase())) {
            this.buildLeaderboard(args[0].toLowerCase());
            return;
        }

        var playerName = args[0];
        if (args[0].toLowerCase() == "me") {
            playerName = author.tag;
        }

        var index = this.players.findIndex(x => x.name == playerName);
        if (index < 0) {
            // Try again but be less spesific
            index = this.players.findIndex(x => x.name.toLowerCase().includes(playerName.toLowerCase()));
        }
        if (index >= 0) {
            const player = this.players[index];
            await this.steam.updatePlayerData(player);
            if (player.stats.length > 0) {
                this.logger.send(this.client.formatPlayerStats(player));
            } else {
                this.logger.send(capitalize(playerName) + " has no stats because they are in leech (private) mode.");
            }
        } else {
            this.logger.error("cannot find player or stat by the name '" + playerName + "' in the database...");
        }
    }

    wipePlayerStats(author) {
        if (!this.isAdmin(author)) {
            this.logger.send("This command can only be used by an admin, which you are not.");
            return;
        }
        this.players.forEach(p => {
            this.logger.log("Updating " + p.name + " stats...");
            this.steam.updatePlayerData(p);
        });

        this.players.forEach(p => {
            if (p.stats.length > 0) {
                this.logger.log("Wiping " + p.name + "...");
                p.stats.forEach(s => {
                    s.wipeValue = s.value;
                    this.logger.log("    " + s.name + ".wipeValue = " + s.wipeValue);
                });
            }
        });
        this.savePlayers();
        this.logger.send("All stats have been wiped!");
    }

    buildLeaderboard(stat) {
        const players = [...this.players];
        var mappedPlayers = players.map(player => {
            const statIndex = player.stats.findIndex(x => x.name == stat);
            const value = (statIndex >= 0) ? player.stats[statIndex].value - player.stats[statIndex].wipeStart : 0;
            return {
                "name": player.name,
                "value": value
            };
        });

        mappedPlayers.sort(function (a, b) {
            return b.value - a.value;
        });
        var txt = "**" + capitalize(stat) + "**\n";
        mappedPlayers.forEach((player, i) => {
            const index = i + 1;
            txt += index + ") *" + capitalize(player.name) + "* - " + player.value + "\n";
        });
        this.logger.send(txt);
    }

    async handlePlayers(args, author) {
        if (args.length <= 0) {
            this.logger.sendBlock("*List*: show all players in database\n*Add DISCORD_TAG STEAMID DISCORDID* OR *Add me STEAMID*: Adds you or the spesified discord user and their steam id\n*Remove DISCORD_TAG/me*", "Commands")
            return;
        }

        switch (args[0].toLowerCase()) {
            case "add":
            case "new":
                if (args.length < 2) {
                    this.logger.error("Please provide either a name, steamid and discordid OR use the keyword 'me' followed by your steamid");
                    return;
                }
                var playerName = args[1];
                var discordId = null;
                if (playerName.toLowerCase() == "me") {
                    playerName = author.tag;
                    discordId = author.id;
                } else {
                    if (args.length >= 4) {
                        discordId = args[3];
                    } else {
                        this.logger.error("Please provide a discord id");
                        return;
                    }
                }
                if (this.players.find(x => x.name.toLowerCase() == playerName.toLowerCase())) {
                    this.logger.error("This player already exists");
                    return;
                }

                const newPlayer = new Player(playerName, args[2], discordId);
                players.push(newPlayer);
                fs.writeFile(playerConfigFile, JSON.stringify(players), err => {
                    if (err) {
                        this.logger.error("Failed to save player config to file!");
                    } else {
                        this.logger.send("Added player '" + newPlayer.name + "' to database.");
                    }
                })
                break;
            case "remove":
                if (args.length < 2) {
                    this.logger.error("Please provide the name of the player to remove, as displayed in list.");
                    return;
                }

                const index = this.players.findIndex(x => x.name.toLowerCase() == playerName.toLowerCase());
                if (index < 0) {
                    this.logger.error("No player with given name found");
                    return;
                }
                if (this.players[index].admin) {
                    this.logger.error("Failed to remove player, they are marked as an admin. Contact the server administrator...");
                    return;
                }
                this.players.splice(index, 1);
                break;
            case "list":
            default:
                var txt = "";
                for (let i = 0; i < this.players.length; i++) {
                    const player = this.players[i];
                    txt = txt + player.name + "\n"; // + " [" + player.steamid + ", " + player.discordid + "]\n";
                }
                this.logger.sendBlock(txt, "Players");
                break;
        }
        this.savePlayers();
    }

    handleDevices(args) {
        const arg0 = (args.length >= 1) ? args[0].toLowerCase() : null;
        const arg1 = (args.length >= 2) ? args[1] : null;
        const arg2 = (args.length >= 3) ? args[2] : null;

        if (!arg0) {
            this.logger.sendBlock("*List* - list all devices\n*Add NAME DEVICE_ID*- adds a smart device\n*Remove NAME*- removes device from list\n*NAME on/off*- turns device on off. Leave blank for current status.", "Device Commands");
            return;
        }

        switch (arg0) {
            case "list":
                var txt = "";
                this.devices.forEach((e, i) => {
                    const numb = i + 1;
                    txt += "\n" + numb + ") " + e.name + " - " + e.id; // :white_check_mark:
                });
                this.logger.sendBlock(txt, "Devices");
                break;
            case "add":
            case "new":
                if (arg1 && arg2) {
                    const newDevice = {
                        "name": arg1,
                        "id": arg2
                    }
                    this.devices.push(newDevice);
                    this.logger.send("Added device '" + arg1 + "'- save device config to make permenant.");
                } else {
                    this.logger.error("Please provide a name followed by the device id.")
                }
                break;
            case "remove":
                if (arg1) {
                    const device = this.devices.findIndex(x => x.name.toLowerCase() == arg1.toLowerCase());
                    if (device > -1) {
                        this.devices.splice(i, 1);
                        removed = true;
                        this.logger.send("Removed '" + arg1 + "' from devices- save device config to make permenant.");
                    }
                } else {
                    this.logger.error("Please provide a device name (use *list* to see avalible options)")
                }
                break;
            case "all":
                if (arg1) {
                    const powered = stringToBool(arg2);
                    this.devices.forEach(device => {
                        this.server.setDevice(device, powered);
                    });
                } else {
                    this.devices.forEach(device => {
                        this.server.getDevice(device);
                    });
                }
                break;
            default:
                const device = this.devices.find(x => x.name.toLowerCase() == arg0.toLowerCase())
                if (device && arg1) {
                    const powered = stringToBool(arg1);
                    this.server.setDevice(device, powered);
                } else if (device) {
                    this.server.getDevice(device);
                } else {
                    this.logger.error("No device found with that name");
                }

                break;
        }
    }

    savePlayers() {
        fs.writeFile(playerConfigFile, JSON.stringify(this.players), err => {
            if (err) {
                this.logger.error("Failed to save player config to file!");
            } else {
                this.logger.log("Saved player config to file!");
            }
        })
    }

    saveDevices() {
        fs.writeFile(deviceConfigFile, JSON.stringify(this.devices), err => {
            if (err) {
                this.logger.error("Failed to save device config to file!");
            } else {
                this.logger.log("Saved device config to file!");
            }
        })
    }

    isAdmin(author) {
        const player = this.players.find(x => x.discordid == author.id);
        if (player) {
            return player.admin;
        }
        return false;
    }
}

// ==================================================================================================== //
// ==================================================================================================== //
// Misc functions
function stringToBool(text) {
    switch (text.toLowerCase()) {
        case "on":
        case "1":
            return true;
        case "off":
        case "0":
            return false;
        default:
            return null;
    }
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// ==================================================================================================== //
// ==================================================================================================== //
module.exports = {
    IceBot
};