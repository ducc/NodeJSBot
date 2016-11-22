const Util = require("util");
const Discordie = require("discordie");
const YamlConfig = require("node-yaml-config");
const MESSAGE_FORMAT = "[%s - #%s] %s: %s";
const client = new Discordie();
const config = YamlConfig.load(__dirname + "/config.yml");

let prefix = "s";
let userId;
let ready = false;

/*
because with the prefix it makes spong.ping()
 */
class Pong {
    constructor() {
    }

    help() {
        return "get some pls";
    }

    ping() {
        return "<@" + userId + ">";
    }

    clean(channel, num) {
        const messages = channel.messages.reverse();
        if (num == -1) num = 1000;
        let count = 0;
        for (let i = 0; i < messages.length; i++) {
            let message = messages[i];
            if (message.deleted) continue;
            if (message.author.id !== userId) continue;
            count++;
            message.delete();
            if (count > num) {
                break;
            }
        }
        return "ok cleaning " + channel.name;
    }
}

const pong = new Pong();

client.connect({
    token: config.token
});

//noinspection JSUnresolvedVariable
client.Dispatcher.on(Discordie.Events.GATEWAY_READY, function() {
    console.log("Connected as: " + client.User.username)
    userId = client.User.id;
    ready = true;
});

client.Dispatcher.on(Discordie.Events.MESSAGE_CREATE, function(e) {
    if (!ready) return;
    const msg = Util.format(MESSAGE_FORMAT, e.message.guild.name, e.message.channel.name, e.message.author.username,
        e.message.content);
    console.log(msg);
    if (e.message.author.id !== userId || !e.message.content.startsWith(prefix)) return;
    let content = e.message.content.substring(1);
    let newMsg = false;
    if (content.startsWith("#")) {
        content = content.substring(1);
        newMsg = true;
    }
    let channel = e.message.channel;
    try {
        let result = eval(content);
        console.log(result);
        if (result !== undefined) {
            if (newMsg) {
                channel.sendMessage(result);
            } else {
                e.message.edit(e.message.content.substring(1) + ": " + result);
            }
        }
    } catch (ex) {
        console.log(ex);
        if (newMsg) {
            channel.sendMessage(ex.message);
        } else {
            e.message.edit(e.message.content.substring(1) + ": " + ex.message);
        }
    }
});
