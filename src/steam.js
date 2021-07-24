const fetch = require('node-fetch');
const playerConfigFile = "./config/players.json";

class Steam {
    stats = [{
            "name": "wood",
            "get": "harvested_wood",
            "type": "farm"
        },
        {
            "name": "stone",
            "get": "harvested_stones",
            "type": "farm"
        },
        {
            "name": "metal",
            "get": "acquired_metal.ore",
            "type": "farm"
        },
        {
            "name": "scrap",
            "get": "acquired_scrap",
            "type": "farm"
        },
        {
            "name": "cloth",
            "get": "harvested_cloth",
            "type": "farm"
        },
        {
            "name": "leather",
            "get": "harvested_leather",
            "type": "farm"
        },
        {
            "name": "lowgrade",
            "get": "acquired_lowgradefuel",
            "type": "farm"
        },
        {
            "name": "deaths",
            "get": "deaths",
            "type": "pvp"
        },
        {
            "name": "kills",
            "get": "kill_player",
            "type": "pvp"
        },
        {
            "name": "revives",
            "get": "wounded_healed",
            "type": "pvp"
        },
        {
            "name": "rockets",
            "get": "rocket_fired",
            "type": "pvp"
        },
        {
            "name": "headshots",
            "get": "headshot",
            "type": "pvp"
        },
        {
            "name": "k/d",
            "script": this.getPlayerKd.bind(this),
            "type": "pvp"
        },
        {
            "name": "callories",
            "get": "calories_consumed",
            "type": "misc"
        },
        {
            "name": "comfort",
            "get": "comfort_duration",
            "type": "misc"
        }
    ]

    constructor(config, bot) {
        this.bot = bot;
        this.logger = bot.logger;
        this.steamapi = config.steamapi + "?appid=" + config.appid + "&key=" + config.steamkey;
    }

    getPlayerKd(player) {
        const deaths = this.getWipeStat(player, "deaths");
        const kills = this.getWipeStat(player, "kills");
        if (deaths <= 0) {
            return 0;
        }
        return (kills / deaths).toFixed(2);
    }

    getWipeStat(player, stat) {
        if (player.stats.length <= 0) {
            return 0;
        }
        const cache = player.stats.find(x => x.name == stat);
        if (!cache.wipeValue) {
            return cache.value;
        }
        return cache.value - cache.wipeValue;
    }

    async updatePlayerData(player) {
        const steamid = player.steamid;
        const url = this.steamapi + "&steamid=" + steamid;
        this.logger.log("Fetching player data for " + steamid + ": " + url);
        const response = await fetch(url);
        try {
            const playerStatsRaw = await response.json();
            const stats = playerStatsRaw.playerstats.stats;

            var playerData = [];

            this.stats.forEach(stat => {
                if (!stat.hasOwnProperty("script")) {
                    const value = stats.find(x => x.name == stat.get).value;
                    const cache = (player.stats.find(x => x.name == stat.name));
                    const wipeValue = (cache) ? cache.wipeValue : value;
                    playerData.push({
                        "name": stat.name,
                        "value": value,
                        "wipeValue": wipeValue,
                        "sessionValue": wipeValue,
                        "type": stat.type
                    });
                } else {
                    const value = stat.script(player);
                    playerData.push({
                        "name": stat.name,
                        "value": value,
                        "wipeValue": 0,
                        "sessionValue": 0,
                        "type": stat.type
                    });
                }
            });

            // Get live stats from steam
            player.stats = playerData;
            return true;
        } catch (err) {
            player.stats = [];
            return false;
        }
    }
}

module.exports = {
    Steam
};