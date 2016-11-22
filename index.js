var Util = require("util");
var Discordie = require("discordie");
var YamlConfig = require("node-yaml-config");

const MESSAGE_FORMAT = "[%s - #%s] %s: %s";

var client = new Discordie();
var config = YamlConfig.load(__dirname + "/config.yml");

client.connect({
    token: config.token
});

client.Dispatcher.on("GATEWAY_READY", function() {
    console.log("Connected as: " + client.User.username)
});

client.Dispatcher.on("MESSAGE_CREATE", function(e) {
    var msg = Util.format(MESSAGE_FORMAT, e.message.guild.name, e.message.channel.name, e.message.author.username,
        e.message.content);
    console.log(msg);
    if (e.message.content == "(╯°□°）╯︵ ┻━┻") {
        e.message.channel.sendMessage("┬─┬ ノ( ゜-゜ノ)");
    }
});
