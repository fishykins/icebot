const RustPlus = require('@liamcottle/rustplus.js');
const fs = require("fs");


// ==================================================================================================== //
// ==================================================================================================== //
// Main class
class Server {
    constructor(config, bot) {
        this.bot = bot;
        this.config = config;
        this.rust = new RustPlus(config.ip, config.port, config.playerToken.steamid, config.playerToken.token);
        this.logger = bot.logger;
        this.connected = false;
        this.autoConnect = config.autoConnect;
        this.onConnect = null;
        this.onDisconnect = null;

        this.rust.on('connected', () => {
            this.connected = true;
            this.logger.setRustChat(this.rust);
            if (this.onConnect) {
                this.onConnect();
            }
        });

        this.rust.on('message', (message) => {
            this.logger.log("received message from server: " + JSON.stringify(message));
        });

        this.rust.on('error', (message) => {
            this.logger.error("received error from server: " + message.error);
            if (this.autoConnect) {
                this.connect()
            }
        });

        this.rust.on('disconnected', () => {
            this.connected = false;
            this.logger.warning("Server disconnected");
            if (this.onDisconnect) {
                this.onDisconnect();
            }
            if (this.autoConnect) {
                this.connect(null);
            }
        });
    }

    setDevice(device, targetState) {
        this.logger.log("handling device '" + device.name + "'");
        // Handle the device
        this.rust.getEntityInfo(device.id, (amessage) => {
            if (amessage.response.hasOwnProperty('error')) {
                this.logger.eror("I can't find the group named '" + device.name + "'- maybe the switch has been removed or some twat has cleared tc?");
                return;
            }
            var entity = amessage.response.entityInfo;
            var entityType = entity.type;
            var isOn = entity.payload.value;

            if (entityType == 3) {
                this.logger.send(device.name + " is a smart switch- you cannot turn it on/off!");
                return;
            }

            if (targetState == isOn) {
                const txt = (isOn) ? device.name + " is already on" : device.name + " is already off";
                this.logger.send(txt);
                return;
            }

            if (targetState) {
                this.rust.turnSmartSwitchOn(device.id, (_) => {
                    this.logger.announce(device.name + " is now ON");
                })
            } else {
                this.rust.turnSmartSwitchOff(device.id, (_) => {
                    this.logger.announce(device.name + " is now OFF");
                })
            };
        });
    }

    getDevice(device) {
        this.rust.getEntityInfo(device.id, (amessage) => {
            if (amessage.response.hasOwnProperty('error')) {
                this.logger.eror("I can't find the group named '" + device.name + "'- maybe the switch has been removed or some twat has cleared tc?");
                return;
            }
            var entity = amessage.response.entityInfo;
            var entityType = entity.type;
            var value = entity.payload.value;
            
            if (!value && entityType == 3) {
                // Storage monitor
                var items = entity.payload.items;
                this.logger.send(`Storage device ${device.name} contains ${items.length} item(s)`);

                // print out the items in this storage entity
                items.forEach((item) => {
                    this.logger.send(item);
                });
                return;
            } else {
                const txt = (value) ? device.name + " is currently ON" : device.name + " is currently OFF";
                this.logger.send(txt);
            }
        });
    }

    connect(callback) {
        this.rust.connect();
        if (callback) {
            this.onConnect = callback;
        }
        this.logger.log("server Connecting on " + this.config.ip + ":" + this.config.port + " with playerId=" + this.config.playerToken.steamid + ", token=" + this.config.playerToken.token);
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

function jsonWriter(filepath, data) {
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