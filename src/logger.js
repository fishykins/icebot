class Logger {
    constructor() {
        this.user = null;
        this.discordChannel = null;
        this.debuging = false;
        this.showWarnings = true;
        this.rustChat = null;
    }

    addDiscordChat(chat) {
        this.discordChannel = chat;
    }

    setDiscordUser(user) {
        this.user = user;
    }

    setRustChat(chat) {
        this.rustChat = chat;
    }

    send(message) {
        console.log(message);
        if (this.discordChannel != null) {
            this.discordChannel.send(message);
        }
    }

    announce(message) {
        console.log(message);
        if (this.discordChannel != null) {
            this.discordChannel.send(message);
        }
        if (this.rustChat != null) {
            this.rustChat.sendTeamMessage("[BOT] " + message);
        }
    }

    sendBlock(message, title) {
        console.log(message);
        if (this.discordChannel != null) {
            var txt = "";
            if (title) {
                txt = "**" + title + "**\n";
            }
            this.discordChannel.send(txt + "```" + message + "```");
        }
        if (this.rustChat != null) {
            this.rustChat.sendTeamMessage("[BOT] " + message);
        }
    }

    log(message) {
        if (this.debuging) {
            this.send("```" + message + "```");
        } else {
            console.log(message);
        }
    }

    warning(message) {
        if (this.showWarnings) {
            this.send("```fix\n[WARNING]: " + message + "```");
        } else {
            console.warn(message);
        }
    }

    error(message) {
        this.send("```diff\n-[ERROR]: " + message + "```");
        console.error(message);
    }

    noServerError() {
        this.error("No server (Rust+) connected!");
    }

    noClientError() {
        this.error("No cliend (Discord) connected!");
    }

    status(message) {
        if (this.user != null) {
            this.user.setActivity(message);
        }
    }
}

module.exports = {
    Logger
};