module.exports = function play(msg) {
    // Only try to join the sender's voice channel if they are in one themselves
    if (msg.member.voiceChannel) {
        msg.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
            msg.reply('I have successfully connected to the channel!');
            // To play a file, we need to give an absolute path to it
            const dispatcher = connection.playFile('C:/Users/Discord/Desktop/myfile.mp3');
        })
        .catch(console.log);
    } else {
        msg.reply('Please join a voice channel first.');
    }
}