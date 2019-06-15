//const prefix = config.prefix;
const Discord = require('discord.js');

/*
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const isDirectory = source => lstatSync(source).isDirectory()
const getDirectories = source =>
    readdirSync(source).map(name => join(source, name)).filter(isDirectory)
*/

module.exports = function listCommands(prefix, msg) {
    const embed = new Discord.RichEmbed();
    /*
    const directories = getDirectories('./src/commands');
    const commands = [];

    directories.forEach(function(item) {
        commands.push(item.slice(13));
    });
    ----------------------------------
    for (var i = 1; i < commands.length; i++) {
        embed.addField(commands[i]);
    }
    */
    embed.setTitle(':robot: Things I can do :robot: ')
    embed.setDescription('More info: https://discordbots.org/bot/455038517983051816');
    embed.addField(':dart:  FUN STUFF', '--------------');
    embed.addField('Memes', `View a joke: ${prefix}meme`, true);
    embed.addField('Jokes', `View a joke: ${prefix}joke`, true);
    embed.addField('Amazeme', `Be amazed: ${prefix}amazeme`, true);
    embed.addField('Music', `View music streaming help: ${prefix}music`, true);
    embed.addField('Advice', `Ask for bot advice: ${prefix}ask`, true);
    embed.addField(':tools: USEFUL STUFF', '--------------');
    embed.addField('The Purge', `Purge messages: ${prefix}purge [num]`, true);
    embed.addField('Ping', `View latency to server: ${prefix}ping`, true);
    embed.addField('Bot Status', `View bot info: ${prefix}info`, true);
    embed.setColor('#2196f3');
    embed.setFooter('Note: This bot is a WIP. Expect frequent updates!');
    embed.setAuthor('Alexi5 Commands Help');
    msg.channel.send(embed);
}