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

const prefix = config.prefix;
const token = config.token;
const ytkey = config.youtube;

var time = new Date();
var timestamp = '[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + ']';

function stream(connection, msg) {
    var server = servers[msg.guild.id];
    // audioonly || highestaudio
    server.dispatcher = connection.playStream(ytdl(server.queue[0], { quality: "highestaudio" }));
    console.log('stream:' + server.queue);

    server.dispatcher.on("end", function() {
        // Remove the current song from the queue
        server.queue.shift();
        if (server.queue[0]) {
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
    bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
    console.log(`Bot is up and running`);
    console.log(`--------------------------------------------`);
});

//Credits for these helpful stats: https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3
bot.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    bot.user.setActivity(`Serving ${bot.users.size} discord users`);
});

bot.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    bot.user.setActivity(`Serving ${bot.guilds.size} servers`);
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
                break;
            case 'joke':
                joke(msg);
                break;
            case 'amazeme':
                amazeme(msg);
                break;
            case 'list':
                listCommands(msg);
                break;
            case 'ping':
                const m = await msg.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
                break;
            case 'music':
                // music {args[1]} || music {args[1]} {args[2]}
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
                    if (!msg.member.voiceChannel) {
                        msg.reply('Please join a voice channel first.');
                        return;
                    }

                    if (!servers[msg.guild.id]) {
                        servers[msg.guild.id] = {
                            queue: []
                        }
                    }

                    var server = servers[msg.guild.id];

                    if (args[1] == 'play') {
                        if (!msg.guild.voiceChannel) {
                            msg.member.voiceChannel.join().then(connection => {
                                // Append song to queue
                                stream(connection, msg);
                                console.log('play:' + server.queue);
                            }).catch(console.log);
                        }
                    }

                    console.log('========================================');
                    console.log(args[0]);
                    console.log(args[1]);
                    console.log(args[2]);
                    console.log('========================================');



                    if (args[1] == 'add') {
                        var server = servers[msg.guild.id];
                        // Playlist resolver
                        var playlistResolve = 'playlist';
                        if (args[2].includes(playlistResolve)) {
                            var playlistId = args[2].split('=').pop();
                            console.log('id: ' + playlistId);
                            got(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${ytkey}&maxResults=50`).then(response => {
                                let result = JSON.parse(response.body);
                                var count = result.pageInfo.totalResults;
                                var flag = 'Deleted video';
                                var titleQueue = [];
                                // The list API doesn't provide a property for videoIDs
                                // Instead the video IDs are provided in the thumbnail URLs
                                // Building the video URLS after extracting the IDs from the thumbnails
                                for (var video in result.items) {
                                    if (!result.items[video].snippet.title.includes(flag)) {
                                        var videoId = result.items[video].snippet.thumbnails.default.url.replace('https://i.ytimg.com/vi/', '').replace('/default.jpg', '');
                                        var videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                                        server.queue.push(videoUrl);
                                        titleQueue.push(result.items[video].snippet.title);
                                        console.log(titleQueue);
                                    }
                                }
                                msg.channel.send(`Playlist successfully parsed and loaded. ${count} songs have been added to the queue.`)
                                    .then(sent => console.log(`A playlist has been loaded`));
                                if (count > 200) {
                                    msg.channel.send(`Wait what?? HOLYSHIT ${count} songs...`)
                                }

                            })
                        } else {
                            server.queue.push(args[2]);
                            msg.delete().catch(O_o => {});
                            msg.channel.send("Song added. Gotta improve this response someday...maybe add a timeout :thinking:");
                            console.log('add:' + server.queue);
                        }
                    }

                    if (args[1] == 'skip') {
                        var server = servers[msg.guild.id];
                        if (server.dispatcher) {
                            server.dispatcher.end();
                        }
                    }
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