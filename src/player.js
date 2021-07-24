  
class Player {
    constructor(name, steamid, discordid) {
        this.name = name;
        this.steamid = steamid;
        this.discordid = discordid;
        this.admin = false;
        this.stats = [];
    }
}

module.exports = { Player };