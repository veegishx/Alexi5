const Discord = require('discord.js');
const bot = new Discord.Client();

let servers = {};
let titles = {};

const got = require('got');
const ytdl = require('ytdl-core');
const config = require('./config.json');
const meme = require('./commands/fun/meme.js');
const joke = require('./commands/fun/joke.js');
const amazeme = require('./commands/fun/amazeme.js');
const music = require('./commands/music/music.js');
const listCommands = require('./commands/default.js');
const info = require('./commands/utility/info.js');

const prefix = config.prefix;
const token = process.env.BOT_TOKEN
const ytkey = config.youtube;

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
                msg.reply("This feature has been removed for now...")
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
            case 'ping':
                const m = await msg.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
                break;
            case 'music':
                if (!args[1]) {
                    const embed = new Discord.RichEmbed();
                    embed.setTitle(':musical_note:  Music Streaming  :musical_note: ')
                    embed.setDescription('Stream music from YouTube using the commands below');
                    embed.addField('Play songs in playlist: ', `${prefix}music play`, true);
                    embed.addField('Add track to playlist: ', `${prefix}music add [url]`, true);
                    embed.addField('Skip current track: ', `${prefix}music skip`, true);
                    embed.addField('Stop streaming music & leave channel: ', `${prefix}leave`, true);
                    embed.setColor('#2196f3');
                    embed.setFooter('Note: Make sure that the playlist contains at least one song before playing it. You can also add songs on the go.');
                    embed.setAuthor('Alexi5 Music Streaming Help');
                    msg.channel.send(embed);
                } else {
                    music(ytkey, servers, titles, msg, args[0], args[1], args[2]);
                }
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
