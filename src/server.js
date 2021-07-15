const Discord = require("discord.js");
const RustPlus = require('@liamcottle/rustplus.js');
const deviceConfigFile = "./config/devices.json";
const fs = require('fs');


// ==================================================================================================== //
// ==================================================================================================== //
// Main class
class Server {
    constructor(ip, port, player, logger, autoConnect) {
        this.ip = ip;
        this.port = port;
        this.player = player;
        this.logger = logger;
        this.connected = false;
        this.rust = new RustPlus(this.ip, this.port, this.player.id, this.player.token);
        this.autoReconnect = autoConnect;
        this.onConnect = null;
        this.onDisconnect = null;
        this.devices = [];

        jsonReader(deviceConfigFile, (err, devices) => {
            if (err) {
                console.error(err)
                return
            }
            this.devices = devices;
        });

        this.logger.send("found " + this.devices + " device configs");
        this.logger.send("server config established- using " + player.name + " as host");

        this.rust.on('connected', () => {
            this.connected = true;
            this.logger.setRustChat(this.rust);
            if (this.onConnect) {
                this.onConnect();
            }
        });

        this.rust.on('message', (message) => {
            this.logger.log("received message from server: " + message[0]);
        });

        this.rust.on('error', (message) => {
            this.logger.error("received error from server: " + message.error);
            if (this.autoReconnect) {
                this.connect()
            }
        });

        this.rust.on('disconnected', () => {
            this.connected = false;
            this.logger.warning("Server disconnected");
            if (this.onDisconnect) {
                this.onDisconnect();
            }
            if (this.autoReconnect) {
                this.connect(null);
            }
        });
    }

    handleDevices(args) {
        if (args.length == 0 || args[0] == "list") {
            var txt = "";
            this.devices.forEach((e, i) => {
                const numb = i + 1;
                txt += "\n" + numb + ") " + e.name + " - " + e.id;
            });
            this.logger.sendBlock(txt, "Devices");
        } else if (args[0] == "save") {
            fs.writeFile(deviceConfigFile, JSON.stringify(this.devices), err => {
                if (err) {
                    this.logger.error("Failed to save device config to file!");
                } else {
                    this.logger.send("Saved device config to file!");
                }
            })

        } else if (args[0] == "new" || args[0] == "add") {
            if (args.length >= 3) {
                var newDevice = {
                    "name": args[1],
                    "id": args[2]
                }
                this.devices.push(newDevice);
                this.logger.send("Added device '" + args[1] + "'- save device config to make permenant.");
            } else {
                this.logger.error("Not enough parameters provided- I need a name and ID to do that sir!");
            }
        } else if (args[0] == "remove" && args.length >= 2) {
            var removed = false;
            for (let i = 0; i < this.devices.length && !removed; i++) {
                const d = this.devices[i];
                if (d.name == args[1] || d.id == args[1]) {
                    this.devices.splice(i, 1);
                    removed = true;
                    this.logger.send("Removed '" + args[1] + "' from devices- save device config to make permenant.");
                }
            }
            if (!removed) {
                this.logger.error("Could not remove device '" + args[1] + "'- no such device!");
            }
        }
    }

    connect(callback) {
        this.rust.connect();
        if (callback) {
            this.onConnect = callback;
        }
        this.logger.log("server Connecting on " + this.ip + ":" + this.port + " with playerId=" + this.player.id + ", token=" + this.player.token);
    }

    disconnect(callback) {
        if (this.isConnected()) {
            this.rust.disconnect();
            this.logger.setRustChat(null);
            if (callback) {
                this.onDisconnect = callback;
            }
            this.logger.send("Terminating (rust+) connection...");
        } else {
            this.logger.noServerError();
        }
    }

    destroy() {
        if (this.rust) {
            this.disconnect(() => {
                this.rust.destroy();
                this.logger = null;
                
            });
        }
    }

    isConnected() {
        if (this.rust && this.connected) {
            return true;
        }
        return false;
    }

    getInfo() {
        if (this.isConnected()) {
            this.rust.getInfo(this.receivedInfo.bind(this));
        } else {
            this.logger.noServerError();
        }
    }

    getPlayerCount() {
        if (this.isConnected()) {
            this.rust.getInfo(this.receivedPlayerCount.bind(this));
        } else {
            this.logger.noServerError();
        }
    }

    receivedInfo(message) {
        this.logger.send("Current server: " + message.response.info.name);
    }

    receivedPlayerCount(message) {
        this.logger.send("There are " + message.response.info.players + "/" + message.response.info.maxPlayers + " players online (" + message.response.info.queuedPlayers + " queued).");
    }


}

// ==================================================================================================== //
// ==================================================================================================== //
// Misc functions
function jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return cb && cb(err)
        }
        try {
            const object = JSON.parse(fileData)
            return cb && cb(null, object)
        } catch (err) {
            return cb && cb(err)
        }
    })
}

function jsonWriter(filepath, data, cb) {
    fs.writeFile(filepath, data.toString(), err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote to file ', filepath);
        }
    })
}

// ==================================================================================================== //
// ==================================================================================================== //
module.exports = {
    Server
};