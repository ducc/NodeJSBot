const Util = require("util");
const Discordie = require("discordie");
const YamlConfig = require("node-yaml-config");
const Request = require("request");
const MESSAGE_FORMAT = "[%s - #%s] %s: %s";
const client = new Discordie();
const config = YamlConfig.load(__dirname + "/config.yml");

let prefix = config.prefix;
let userId;
let ready = false;

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
    if (e.message.isPrivate) {
        console.log(Util.format(MESSAGE_FORMAT, e.message.guild.name, e.message.channel.name, e.message.author.username,
            e.message.content));
    } else {
        console.log(Util.format(PRIVATE_MESSAGE_FORMAT, e.message.channel.name, e.message.author.username,
            e.message.content));
    }
    if (e.message.author.id !== userId || !e.message.content.startsWith(prefix)) return;
    let content = e.message.content.substring(prefix.length);
    let newMsg = false;
    if (content.startsWith("#")) {
        content = content.substring(1);
        newMsg = true;
    }
    let msg = e.message;
    let channel = msg.channel;
    let author = msg.author;
    try {
        let result = eval(content);
        console.log(result);
        if (result !== undefined) {
            if (newMsg) {
                channel.sendMessage(result);
            } else {
                appendEdit(e.message, result);
            }
        }
    } catch (ex) {
        console.log(ex);
        if (newMsg) {
            channel.sendMessage(ex.message);
        } else {
            appendEdit(e.message, ex.message);
        }
    }
});

function appendEdit(message, content) {
    message.edit(message.content.substring(prefix.length) + ": " + content);
}

function clean(channel, num) {
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

function urban(message, term) {
    Request({
        url: "https://mashape-community-urban-dictionary.p.mashape.com/define?term=" + encodeURIComponent(term),
        headers: {
            "X-Mashape-Key": config.mashape,
            "Accept": "text/plain"
        }
    }, function callback(error, response, body) {
        if (error || response.statusCode != 200) {
            appendEdit(message, "something went wrong! " + error + " - " + response.statusCode);
            return;
        }
        let object = JSON.parse(body);
        if (object.result_type === "no_results") {
            appendEdit(message, "no results");
            return;
        }
        appendEdit(message, object.list[0].definition);
    });
}