const Discord = require('discord.js');
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
readdirSync(source).map(name => join(source, name)).filter(isDirectory)


module.exports = function listCommands(msg) {
    const embed = new Discord.RichEmbed();
    const directories = getDirectories('./src/commands');
    const commands = [];

    directories.forEach(function(item) {
        commands.push(item.slice(13));
    });
    embed.setTitle(':robot: My Commands');
    embed.setDescription('Here\'s a list of commands you can run to make me perform tasks');
    embed.addField('Commands:', commands, true);
    embed.addField('Usage: ', `${prefix}[command] || ${prefix}[command] [arg]`, true);
    embed.addField('Example: ', `${prefix}ping, ${prefix}joke, ${prefix}meme, ${prefix}del 3, ${prefix}kick @somebody`, true);
    embed.setColor('#2196f3');
    msg.channel.send(embed);
}