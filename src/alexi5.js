const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');

let servers = {};
let titles = {};

const got = require('got');
const ytdl = require('ytdl-core');
const config = require('./config.json');
const music = require('./commands/music/music.js');
//const listCommands = require('./commands/utility/default.js');
const info = require('./commands/utility/info.js');
//const meeting = require('./commands/utility/meeting.js');

const prefix = config.prefix;
const token = config.token;
const ytkey = config.youtube;

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

const CommandManager = fs.readdirSync('./commands/');

CommandManager.forEach(c => {
    fs.readdir(`./commands/${c}/`, (err, files) => {
        if (err) throw err;
        console.log(`[CommandManager] Loaded ${files.length} commands of module ${c}`);

        files.forEach(f => {
            const commands = require(`./commands/${c}/${f}`);

            bot.commands.set(commands.name, commands);
            bot.aliases.set(commands.alias, commands);

            console.log(`[CommandManager] Name: ${commands.name} ( ${commands.alias} )`);
        });
        console.log("-----------------------------------------------");
    });
});

var time = new Date();
var timestamp = '[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ']';

bot.on('ready', () => {
    console.log(`${timestamp} Logged in as ${bot.user.tag}!`);
    console.log(`--------------------------------------------`);
    console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`);
    console.log(`Bot is up and running`);
    //console.log(bot.guilds);
    //bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
    console.log(`--------------------------------------------`);
    bot.user.setActivity(`Aye +!help`);
});


bot.on('message', async (message) => {
    // Ignore any bot messages or messages that do not start with the prefix set
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const userCommand = args.shift().toLowerCase();

    // If command sent by user is registered with the bot then execute command
    // Else send reply to inform user that command does not exist
    try {
        const command = bot.commands.get(userCommand);
        command.execute(message, args);
    } catch(err) {
        message.channel.send("Zoinks, I cannot understand this command!")
        console.log(`${err.name}: ${err.message}`);
    }

    console.log(`userCommands: ${userCommand}`);
    console.log(`args: ${args}`);
});

bot.login(token);