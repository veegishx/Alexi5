const stream = require('./stream');
const got = require('got');
const Discord = require('discord.js');
module.exports = function music(ytkey, servers, titles, msg, prefix, musicCommand, resourceUrl) {
    // music {musicCommand} || music {musicCommand} {resourceUrl}
    if (!musicCommand) {
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

            titles[msg.guild.id] = {
                queue: []
            }
        }

        let server = servers[msg.guild.id];
        let title = title[msg.guild.id];

        console.log('========================================');
        console.log(prefix);
        console.log(musicCommand);
        console.log(resourceUrl);
        console.log('========================================');



        if (musicCommand == 'add') {
            try {
                // Playlist resolver
                var playlistResolve = 'list';
                if (resourceUrl.includes(playlistResolve)) {
                    let truncatedId = resourceUrl.split('=');
                    let playlistId = truncatedId[2];
                    console.log('id: ' + playlistId);
                    got(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&key=${ytkey}`).then(response => {
                        let result = JSON.parse(response.body);
                        let count = result.pageInfo.totalResults;
                        let flag = 'Deleted video';
                        // The list API doesn't provide a property for videoIDs
                        // Instead the video IDs are provided in the thumbnail URLs
                        // Building the video URLS after extracting the IDs from the thumbnails
                        for (var video in result.items) {
                            if (!result.items[video].snippet.title.includes(flag)) {
                                var videoId = result.items[video].snippet.thumbnails.default.url.replace('https://i.ytimg.com/vi/', '').replace('/default.jpg', '');
                                var videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                                server.queue.push(videoUrl);
                                title.queue.push(result.items[video].snippet.title);
                                console.log(`Initialized queue with: ${title.queue}`);
                            }
                        }
                        msg.channel.send(`Playlist successfully parsed and loaded. ${count} songs have been added to the queue.`)
                            .then(sent => console.log(`A playlist has been loaded`));
                        if (count > 200) {
                            msg.channel.send(`Wait what?? HOLYSHIT ${count} songs...`)
                        }

                    })
                } else {
                    let longFormat = '=';
                    if (resourceUrl.includes(longFormat)) {
                        var videoId = resourceUrl.split('=').pop();
                    } else {
                        var videoId = resourceUrl.splitOnLast('/')[1].split('/').pop();
                    }

                    got(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${ytkey}`).then(response => {
                        let result = JSON.parse(response.body);
                        let videoTitle = result.items[0].snippet.title;
                        server.queue.push(resourceUrl);
                        msg.channel.send(`${videoTitle} has been added to queue`);
                        console.log('Song added:' + server.queue);
                    })
                }
            } catch (e) {
                msg.channel.send("Invalid arguments detected. See `+!music")
            }
        }

        if (musicCommand == 'play') {
            if (server.dispatcher) {
                msg.channel.send("Music is already being streamed")
            } else {
                msg.member.voiceChannel.join().then(connection => {
                    // Append song to queue
                    stream(msg, servers, titles, connection);
                    console.log('play:' + server.queue);
                }).catch(console.log);
            }
            /*
            if (!msg.guild.voiceChannel) {

            }
            */
        }


        if (musicCommand == 'skip') {
            if (server.dispatcher) {
                title.queue.shift();
                server.dispatcher.end();
            }
        }

        if (musicCommand == 'list') {
            if (server.queue[0]) {
                console.log(title.queue.length);
                for (i = 0; i < title.queue.length; i++) {
                    console.log(title.queue[i + 1]);
                }
            }
        }
    }
}