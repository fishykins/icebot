const homosexualNouns = ["gey", "gay", "homo", "bent"];
const rudeAdjectives = ["smelly", "arsey", "poopy", "cunty", "twatty", "slimey", "cretinous", "annoying", "dirty", "sorded", "grumpy", "horrible", "repulsive", "ugly", "stupid"];
const otherAdjectives = ["adorable", "bloody", "ashamed", "delightful", "glorious", "glamorous", "gleaming", "strange", "tender", "zealous"];
const badNouns = ["arse", "snake", "bastard", "minge", "twat", "pepega", "poopface", "rat", "midget", "fuck", "cunt", "penis", "vagina", "booby", "butt", "goon", "froon", "goof"];
const miscNouns = ["badger", "bunny", "baloon", "bicycle", "face", "toe", "meat", "shirt", "tongue", "student", "girl", "boy", "paper", "hotel", "computer", "plane", "jellyfish", "crab", "lobster"];
const verbs = ["lick", "creep", "ring", "touch", "fuck", "grease", "doorcamp", "roofcamp", "leach", "sniff", "whip", "squeeze", "stain", "prick", "peck", "suck"];
const adjectives = rudeAdjectives.concat(otherAdjectives);
const nouns = badNouns.concat(miscNouns);
const insults = homosexualNouns.concat(rudeAdjectives, badNouns);

class Chatter {
    constructor(logger, names) {
        this.logger = logger;
        this.names = names;
    }

    chat(message) {
        for (let i = 0; i < this.names.length; i++) {
            if (message.toLowerCase().includes(this.names[i])) {
                this.talkBack(message);
                i = this.names.length + 1;
            }
        }
    }

    talkBack(message) {
        if (check(message, [" why", " y "])) {
            this.why(message);
        } else if (check(message, ["can you ", "can u ", "do you ", "do u ", "are you", "are u"])) {
            this.canYou(message);
        } else if (check(message, insults)) {
            if (Math.random() > 0.3) {
                const responses = ["Well you're a " + randomInsult(), "At least i'm not a " + randomInsult() + " like you", "Id Rather be that than be a " + randomInsult()];
                this.reply(selectRandom(responses));
            } else {
                const responses = ["No u", "var shitsGiven = null", "If I cared, I would ask", "Go drown in a pool of your own tears", "If only you could insult as well as you can leach", "You're more of a bot than I am"];
                this.reply(selectRandom(responses));
            }
        }
    }

    canYou(message) {
        if (check(message, ["not", "stop", "refrain", "die"])) {
            this.appologise();
        } else if (check(message, insults)) {
            const responses = ["I don't know- can you " + selectRandom(verbs) + " a " + selectRandom(nouns) + "?"];
            this.reply(selectRandom(responses));
        } else {
            const responses = ["Sometimes, yes.", "I'd rather not talk about it", "No", "Yes", "Maybe", "I dont know, ask again later"];
            this.reply(selectRandom(responses));
        }
    }

    why(message) {
        if (check(message, ["not", "dont", "don't", "wont", "won't"]) && check(message, ["work"])) {
            this.appologise();
        } else if (check(message, ["broken", "dead", "buggy"])) {
            this.appologise();
        } else if (check(message, homosexualNouns)) {
            const responses = ["I once had sex with your mother and that was enough.", "I'd rather be gay than have sex with you.", "It all started when I met your father...", "Because women repulse me", "Technically I orientate towards anything that isn't authed"];
            this.reply(selectRandom(responses));
        } else if (check(message, insults)) {
            const responses = ["Because I have to deal with " + randomInsult() + "s like you all day", "Duno mate, why are you such a " + randomInsult() + "?", "Its probably because you're a " + randomInsult()];
            this.reply(selectRandom(responses));
        } else {
            const responses = ["Fishy hasn't taught me how to speak moron yet, please rephrase your question", "that made about as much sense as the end of interstellar, try again.", "I only speak English, I'm still a bit rusty when it comes to Troll"];
            this.reply(selectRandom(responses));
        }
    }

    reply(response) {
        this.logger.send(response);
    }

    appologise() {
        const responses = ["I'm trying my best, please be nice.", "Because I can only do so much. Sorry", "I don't know, ask Fishy", "I cant say, but it's probably Fishy's fault", "Please forgive me, I'm trying **REALLY** hard", "I'm so sorry, can you ever forgive me?"];
        this.reply(selectRandom(responses));
    }
}

function check(message, words) {
    for (let i = 0; i < words.length; i++) {
        if (message.includes(words[i])) {
            return true;
        }
    }
    return false;
}

function selectRandom(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function randomInsult() {
    var txt = "";
    if (Math.random() > 0.5) {
        txt = txt + adjectives[Math.floor(Math.random() * adjectives.length)] + " ";
    }
    return txt + nouns[Math.floor(Math.random() * nouns.length)] + " " + verbs[Math.floor(Math.random() * verbs.length)] + "er";
}

module.exports = {
    Chatter
};