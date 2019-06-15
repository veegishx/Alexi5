//const prefix = config.prefix;
const Discord = require('discord.js');
const moment = require('moment-timezone');
let i = 0;
module.exports = function info(msg, time, title, option) {
    let value = time * 60;
    msg.channel.send(`@everyone Meeting **${title}** is due in :clock2: ${time} minutes`);
}