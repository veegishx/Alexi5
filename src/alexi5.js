const Discord = require('discord.js');
const bot = new Discord.Client();

var servers = {};

const got = require('got');
const ytdl = require('ytdl-core');
const config = require('./config.json');
const meme = require('./commands/fun/meme.js');
const nsfw = require('./commands/nsfw/nsfw.js');
const joke = require('./commands/fun/joke.js');
const amazeme = require('./commands/fun/amazeme.js');
const play = require('./commands/music/play.js');
const listCommands = require('./commands/default.js');
const info = require('./commands/utility/info.js');
const meeting = require('./commands/utility/meeting.js');

const prefix = config.prefix;
const token = config.token;
const ytkey = config.youtube;

var time = new Date();
var timestamp = '[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ']';

function stream(connection, msg) {
    var server = servers[msg.guild.id];
    // audioonly || highestaudio
    server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter: "audioonly" }));
    console.log('stream:' + server.queue);

    server.dispatcher.on("end", function() {
        // Remove the current song from the queue
        server.queue.shift();
        if (server.queue[0]) {
            msg.channel.send('Now playing: ' + server.queue[0]);
            // Keep streaming as long as there is at least 1 item in queue
            stream(connection, msg);
        } else {
            // Make bot leave if queue has no item
            connection.disconnect();
        }
    });
}

bot.on('ready', () => {
    console.log(`${timestamp} Logged in as ${bot.user.tag}!`);
    console.log(`--------------------------------------------`);
    console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`);
    console.log(`Bot is up and running`);
    //console.log(bot.guilds);
    //bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
    console.log(`--------------------------------------------`);
    bot.user.setActivity(`Playing +!help`);
});

//Credits for these helpful stats: https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3
bot.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

bot.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

bot.on('message', async msg => {
    if (msg.content.substring(0, 2) == prefix) {
        var sentence = msg.content.slice(2);
        var args = sentence.split(" ");

        // It's good practice to ignore other bots. This also makes your bot ignore itself
        // and not get into a spam loop (we call that "botception").
        if (msg.author.bot) return;

        // Also good practice to ignore any message that does not start with our prefix, 
        // which is set in the configuration file.
        if (msg.content.indexOf(config.prefix) !== 0) return;

        if (args[0] == undefined || !args[0].trim().length) {
            msg.channel.send('Error: You need to specify at least 1 argument');
            msg.channel.send(`Try **${prefix}help** for a list of options`);
        }

        switch (args[0].toLowerCase()) {
            case 'help':
                listCommands(prefix, msg);
                break;
            case 'info':
                info(bot, msg);
                break;
            case 'meme':
                meme(msg);
                break;
            case 'nsfw':
                nsfw(msg);
                //msg.reply("Don't even think about it...")
                break;
            case 'joke':
                joke(msg);
                break;
            case 'amazeme':
                amazeme(msg);
                break;
            case 'ask':
                if (!args[1]) {
                    msg.reply("Please ask a question `+!ask your_question`");
                } else {
                    let replies = [
                        'Yes.',
                        'Yes.',
                        'No.',
                        'Perhaps you should consider it.',
                        'Probably.',
                        'Indeed',
                        'Just get over with it.',
                        'Maybe, maybe not. Maybe go fuck yourself.',
                        'When the sun rises north, and when the pigs fly, then thou shalt find what you seek.'
                    ];

                    let botreply = replies[Math.floor(Math.random() * replies.length)];
                    msg.reply(botreply);
                }

                break;
            case 'meeting':
                if (!args[1]) {
                    msg.channel.send("Please specify a time for the meeting.");
                } else {
                    if (args[1]) {
                        meeting(msg, args[1], args[2], args[3]);
                    }
                }
                break;
            case 'list':
                listCommands(msg);
                break;
            case 'ping':
                const m = await msg.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
                break;
            case 'music':
                play(ytkey, servers, msg, args[0], args[1], args[2]);
                break;
            case 'leave':
                if (msg.guild.voiceConnection) {
                    msg.guild.voiceConnection.disconnect();
                    msg.channel.send("Stream has ended ʕ•ᴥ•ʔ");
                }
                break;
            case 'purge':
                const deleteCount = parseInt(args[1], 10);

                if (!deleteCount || deleteCount < 1 || deleteCount > 100)
                    return msg.reply("Please provide a number between 1 and 100 for the number of messages to delete");

                const fetched = await msg.channel.fetchMessages({ limit: deleteCount });
                msg.channel.bulkDelete(fetched).catch(error => msg.reply(`Couldn't delete messages because of: ${error}`));
                msg.channel.send(`PURGE! PURGE! PURGE! ${deleteCount} messages have been slaughtered :)`)
                break;
            default:
                msg.channel.send('This feature hasn\'t been implemented yet :slight_frown:');
        }
    }
});

bot.login(token);