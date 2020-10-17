require("dotenv").config();
const Discord = require('discord.js');
const fs = require('fs');
const got = require('got');
const ytdl = require('ytdl-core');

const prefix = process.env.BOT_PREFIX;
const token = process.env.BOT_TOKEN;

const bot = new Discord.Client();

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

const CommandManager = fs.readdirSync('./src/commands/');



CommandManager.forEach(c => {
    fs.readdir(`./src/commands/${c}/`, (err, files) => {
        if (err) throw err;
        console.log(`[CommandManager] Loaded ${files.length} commands of module ${c}`);

        files.forEach(f => {
            const commands = require(`./src/commands/${c}/${f}`);

            bot.commands.set(commands.name, commands);
            bot.aliases.set(commands.alias, commands);

            console.log(`[CommandManager] Name: ${commands.name} ( ${commands.alias} )`);
        });
        console.log("-----------------------------------------------");
    });
});

bot.on('message', async (message) => {
    // Ignore any bot messages or messages that do not start with the prefix set
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const userCommand = args.shift().toLowerCase();
    const command = bot.commands.get(userCommand) || bot.aliases.get(userCommand);

    switch(userCommand) {
        case "reddit":
        case "fact": {
            const dependencies = [Discord, got];
            command.execute(message, args, dependencies);
            break;
        }
        case "music": {
            const dependencies = [ytdl];
            command.execute(message, args, dependencies);
            break;
        }
        case "help": {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(':robot: Things I can do :robot: ')
            embed.addField(':dart:  FUN STUFF', '--------------');
            embed.addField('Music', `Stream music from YouTube: ${prefix}music`, true);
            embed.addField('Fact', `Get useless facts: ${prefix}fact | ${prefix}fact today`, true);
            embed.addField('Reddit', `Get random content from a subreddit: ${prefix}reddit [subreddit]`, true);
            embed.addField(':tools: USEFUL STUFF', '--------------');
            embed.addField('Ping', `View latency to server: ${prefix}ping`, true);
            embed.addField('Bot Status', `View bot info: ${prefix}info`, true);
            embed.setColor('#2196f3');
            embed.setFooter('Note: This bot is a WIP. Expect frequent updates!');
            embed.setAuthor('Alexi5 Commands Help');
            message.channel.send(embed);
            break;
        }
        case "info": {
            const embed = new Discord.MessageEmbed();
            embed.setTitle(':information_source: Alexi5 Status');
            embed.setDescription('Here\'s some info about me');
            embed.addField(':white_check_mark: API Status', `ONLINE & bot latency to this server is ${Math.round(bot.ping)}ms`);
            embed.addField(':spy:  My masters:', 'SYKC[https://github.com/SYKC] & Veegishx[https://github.com/VEEGISHx]');
            embed.addField(':tools:  Find the code & contribute:', 'https://github.com/VEEGISHx/Alexi5');
            embed.addField(':purple_heart:  My Life', 'I\'m currently being hosted on a Heroku free tier server');
            embed.setColor('#00ff00');
            embed.addField(':satellite_orbital: Server dominance', `Found ${bot.guilds.size} server instances with a population of ${bot.users.size} users`);
            message.channel.send(embed);
            break;
        }
        default:
            // If command sent by user is registered with the bot then execute command
            // Else send reply to inform user that command does not exist
            try {
                command.execute(message, args);
            } catch(err) {
                message.channel.send("Zoinks, I cannot understand this command!")
            }
    }
});

bot.login(token);