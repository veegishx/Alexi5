let queue = new Map();

module.exports = {
    name: 'music',
    alias: 'mu',
    description: 'Streams music from YouTube',
    async execute(message, args, dependencies) {
        const [ytdl] = dependencies;
        try {
            const option = args[0];
            let serverQueue = queue.get(message.guild.id);

            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel)
              return message.channel.send(
                "You need to be in a voice channel to play music!"
              );
            const permissions = voiceChannel.permissionsFor(message.client.user);
            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
              return message.channel.send(
                "I need the permissions to join and speak in your voice channel!"
              );
            }
            
            switch(option) {
                case "play":
                    if(args[1] == null || !args[1].match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)) {
                        message.channel.send("Please provide a valid url: `music play <SONG_OR_PLAYLIST_URL>`");
                    } else {
                        const songInfo = await ytdl.getInfo(args[1]);
                        const song = {
                            title: songInfo.videoDetails.title,
                            url: songInfo.videoDetails.video_url
                        };

                        if(!serverQueue) {
                            let queueConstructor = {
                                textChannel: message.channel,
                                voiceChannel: voiceChannel.channel,
                                connection: null,
                                songs: [],
                                volume: 5,
                                playing: true
                            };
                
                            queue.set(message.guild.id, queueConstructor);
                            queueConstructor.songs.push(song);

                            try {
                                let connection = await voiceChannel.join();
                                queueConstructor.connection = connection;
                                this.play(message.guild, queueConstructor.songs[0], ytdl, message);
                            } catch (error) {
                                console.log(error);
                                queue.delete(message.guild.id);
                                return message.channel.send("ASDSDASDCDSA. There\'s been an error playing this song. I wonder what my devs are up to ._.");
                            }
                        } else {
                            serverQueue.songs.push(song);
                            return message.channel.send(`Song "**${song.title}**" has been queued.`);
                        }
                    }
                    break;
                case "skip":
                    this.skip(message, serverQueue);
                    break;
                case "stop":
                    this.stop()
                    break;
                default:
                    message.channel.send("Error: Only the following options are valid: `music play <url>`, `music skip`, `music stop`");
            }
        } catch (err) {
            console.log(err);
        }
    },

    async play(guild, song, ytdl, message) {
        let serverQueue = queue.get(guild.id);
    
        try {
            message.channel.send(`:loud_sound: Now Playing "**${song.title}**".`);
        } catch (err) {
            message.channel.send("No more songs left in queue. Bye!");
        }

        if(!song){
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        // https://github.com/fent/node-ytdl-core/issues/402
        // Some streams end around 10 seconds earlier. This is a temporary hack: highWaterMark: 1<<25
        const dispatcher = serverQueue.connection
        .play(ytdl(song.url,{fliter:"audioonly", highWaterMark: 1<<25}))
        .on("finish", () => {
            serverQueue.songs.shift();
            this.play(guild, serverQueue.songs[0], ytdl, message);
        })
        .on('error', () => {
            console.log(error)
        })
    
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    },

    skip(message, serverQueue) {
		try {
            if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to skip a song!');
            if (!queue) return message.channel.send('*Can\'t skip as there are no songs queued. Try `music stop` if you want me to stop streaming music.');
            serverQueue.connection.dispatcher.end();
        } catch (err) {
            serverQueue.voiceChannel.leave();
        }
    },

    stop() {
        console.log("Bye!");
    },

    updateQueue() {

    }
}