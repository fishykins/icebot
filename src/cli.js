var methods = [{
        "name": "help",
        "description": "Lists all possible commands",
        "function": help,
        "spellings": ["hlp", "hep", "info", "ifno"]
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
        "spellings": ["srv", "serverinfo", "srver"]
    },
    {
        "name": "players",
        "description": "Gets the number of players currently active on the server",
        "function": playerCount
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
    }
]

function help(_, _, logger, _) {
    var txt = "**All commands**\n";
    methods.forEach(e => {
        if (!e.hidden) {
            txt = txt + "*" + e.name + "* - " + e.description + "\n";
        }
    });
    logger.send(txt);
}

function device(_, server, _, args) {
    server.handleDevices(args);
}

function debug(_, _, logger, args) {
    if (args[0] == "true") {
        logger.debuging = true;
        logger.send("Debugging set to **TRUE**");
    } else if (args[0] == "false") {
        logger.debuging = false;
        logger.send("Debugging set to **FALSE**");
    } else {
        logger.send("Debugging: **" + logger.debuging + "**");
    }
}

function autoConnect(_, server, logger, args) {
    if (args[0] == "true") {
        server.autoReconnect = true;
        logger.send("autoConnect set to **TRUE**");
    } else if (args[0] == "false") {
        server.autoReconnect = false;
        logger.send("autoConnect set to **FALSE**");
    } else {
        logger.send("autoConnect: **" + server.autoReconnect + "**");
    }
}

function serverInfo(_, server, _, _) {
    server.getInfo();
}

function playerCount(_, server, _, _) {
    server.getPlayerCount();
}

function connect(_, server, _, _) {
    server.connect();
}

function disconnect(_, server, _, _) {
    server.disconnect();
}

function quit(client, server, logger, _) {
    logger.send("Good night, dont let the offliners bite!");
    //await new Promise(r => setTimeout(r, 2000));
    server.destroy();
    client.destroy();
}

module.exports = {
    methods
};