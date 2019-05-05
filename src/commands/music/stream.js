const ytdl = require('ytdl-core');
module.exports = function stream(msg, servers, connection) {
    var server = servers[msg.guild.id];
    // audioonly || highestaudio
    server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter: "audioonly" }));
    console.log(`${servers[msg.guild.id]} is streaming: ${server.queue[0]}`);
    console.log(`${servers[msg.guild.id]} queue has: ${server.queue}`);

    server.dispatcher.on("end", function() {
        // Remove the current song from the queue
        server.queue.shift();
        if (server.queue[0]) {
            msg.channel.send('Now playing: ' + server.queue[1]);
            // Keep streaming as long as there is at least 1 item in queue
            stream(msg, servers, connection);
        } else {
            // Make bot leave if queue has no item
            connection.disconnect();
        }
    });
}