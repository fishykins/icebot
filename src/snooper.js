class Snooper {
    constructor() {
        this.channels = [];
    }

    evaluateMessage(message) {
        const id = message.channel;
        if (!this.channels.includes(id)) {
            this.channels.push(id);
            console.log("Discovered a new channel: " + id + " (" + message.channel.name + ")");
        }
    }
}

module.exports = {
    Snooper
};