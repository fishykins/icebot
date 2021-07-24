const fetch = require('node-fetch');
const playerConfigFile = "./config/players.json";

class Steam {
    stats = ["wood", "stone", "metal", "cloth", "leather", "lowgrade", "deaths", "kills", "revives", "rockets", "headshots", "callories", "comfort"];

    constructor(config, bot) {
        this.bot = bot;
        this.logger = bot.logger;
        this.steamapi = config.steamapi + "?appid=" + config.appid + "&key=" + config.steamkey;
    }

    async updatePlayerData(player) {
        const steamid = player.steamid;
        const url = this.steamapi + "&steamid=" + steamid;
        this.logger.log("Fetching player data for " + steamid + ": " + url);
        const response = await fetch(url);
        try {
            const playerStatsRaw = await response.json();
            const stats = playerStatsRaw.playerstats.stats;

            // Get live stats from steam
            const woodTotal = stats.find(x => x.name == "harvested_wood").value;
            const stoneTotal = stats.find(x => x.name == "harvested_stones").value;
            const metalTotal = stats.find(x => x.name == "acquired_metal.ore").value;
            const scrapTotal = stats.find(x => x.name == "acquired_scrap").value;
            const leatherTotal = stats.find(x => x.name == "harvested_leather").value;
            const clothTotal = stats.find(x => x.name == "harvested_cloth").value;
            const lgfTotal = stats.find(x => x.name == "acquired_lowgradefuel").value;

            const deathsTotal = stats.find(x => x.name == "deaths").value;
            const pvpKillsTotal = stats.find(x => x.name == "kill_player").value;
            const reviveTotal = stats.find(x => x.name == "wounded_healed").value;
            const rocketsFiredTotal = stats.find(x => x.name == "rocket_fired").value;
            const headshotsTotal = stats.find(x => x.name == "headshot").value;

            const calloriesTotal = stats.find(x => x.name == "calories_consumed").value;
            const comfortTotal = stats.find(x => x.name == "comfort_duration").value;

            // Get local stats for wipe data
            var woodCache = (player.stats.find(x => x.name == "wood"));
            const woodWipe = (woodCache) ? woodCache.wipeStart : woodTotal;
            var stoneCache = (player.stats.find(x => x.name == "stone"));
            const stoneWipe = (stoneCache) ? stoneCache.wipeStart : stoneTotal;
            var metalCache = (player.stats.find(x => x.name == "metal"));
            const metalWipe = (metalCache) ? metalCache.wipeStart : metalTotal;
            var scrapCache = (player.stats.find(x => x.name == "scrap"));
            const scrapWipe = (scrapCache) ? scrapCache.wipeStart : scrapTotal;
            var leatherCache = (player.stats.find(x => x.name == "leather"));
            const leatherWipe = (leatherCache) ? leatherCache.wipeStart : leatherTotal;
            var clothCache = (player.stats.find(x => x.name == "cloth"));
            const clothWipe = (clothCache) ? clothCache.wipeStart : clothTotal;
            var lgfCache = (player.stats.find(x => x.name == "lowgrade"));
            const lgfWipe = (lgfCache) ? lgfCache.wipeStart : lgfTotal;

            var deathsCache = (player.stats.find(x => x.name == "deaths"));
            const deathsWipe = (deathsCache) ? deathsCache.wipeStart : deathsTotal;
            var killsCache = (player.stats.find(x => x.name == "kills"));
            const killsWipe = (killsCache) ? killsCache.wipeStart : pvpKillsTotal;
            var reviveCache = (player.stats.find(x => x.name == "revives"));
            const reviveWipe = (reviveCache) ? reviveCache.wipeStart : reviveTotal;
            var rocketCache = (player.stats.find(x => x.name == "rockets"));
            const rocketWipe = (rocketCache) ? rocketCache.wipeStart : rocketsFiredTotal;
            var hsCache = (player.stats.find(x => x.name == "headshots"));
            const hsWipe = (hsCache) ? hsCache.wipeStart : headshotsTotal;

            var calloriesCache = (player.stats.find(x => x.name == "callories"));
            const calloriesWipe = (calloriesCache) ? calloriesCache.wipeStart : calloriesTotal;
            var comfortCache = (player.stats.find(x => x.name == "comfort"));
            const comfortWipe = (comfortCache) ? comfortCache.wipeStart : comfortTotal;

            const playerData = [{
                    "name": "wood",
                    "value": woodTotal,
                    "wipeStart": woodWipe,
                    "type": "farm"
                },
                {
                    "name": "stone",
                    "value": stoneTotal,
                    "wipeStart": stoneWipe,
                    "type": "farm"
                },
                {
                    "name": "metal",
                    "value": metalTotal,
                    "wipeStart": metalWipe,
                    "type": "farm"
                },
                {
                    "name": "scrap",
                    "value": scrapTotal,
                    "wipeStart": scrapWipe,
                    "type": "farm"
                },
                {
                    "name": "cloth",
                    "value": clothTotal,
                    "wipeStart": clothWipe,
                    "type": "farm"
                },
                {
                    "name": "leather",
                    "value": leatherTotal,
                    "wipeStart": leatherWipe,
                    "type": "farm"
                },
                {
                    "name": "lowgrade",
                    "value": lgfTotal,
                    "wipeStart": lgfWipe,
                    "type": "farm"
                },
                {
                    "name": "kills",
                    "value": pvpKillsTotal,
                    "wipeStart": killsWipe,
                    "type": "pvp"
                },
                {
                    "name": "deaths",
                    "value": deathsTotal,
                    "wipeStart": deathsWipe,
                    "type": "pvp"
                },
                {
                    "name": "revives",
                    "value": reviveTotal,
                    "wipeStart": reviveWipe,
                    "type": "pvp"
                },
                {
                    "name": "headshots",
                    "value": headshotsTotal,
                    "wipeStart": hsWipe,
                    "type": "pvp"
                },
                {
                    "name": "rockets",
                    "value": rocketsFiredTotal,
                    "wipeStart": rocketWipe,
                    "type": "pvp"
                },
                {
                    "name": "callories",
                    "value": calloriesTotal,
                    "wipeStart": calloriesWipe,
                    "type": "misc"
                },
                {
                    "name": "comfort",
                    "value": comfortTotal,
                    "wipeStart": comfortWipe,
                    "type": "misc"
                }
            ];

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