const ytdl = require('ytdl-core');
module.exports = function stream(msg, servers, titles, connection) {
    let server = servers[msg.guild.id];
    let title = titles[msg.guild.id];
    // audioonly || highestaudio
    server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter: "audioonly", quality: 'highestaudio', highWaterMark: 1 << 25 }), { highWaterMark: 1 });
    console.log(`${servers[msg.guild.id]} is streaming: ${server.queue[0]}`);
    console.log(`${servers[msg.guild.id]} queue has: ${server.queue}`);

    server.dispatcher.on("end", function() {
        // Remove the current song from the queue
        server.queue.shift();
        title.queue.shift();
        if (server.queue[0]) {
            msg.channel.send(`Now playing **${title.queue[0]}**`);
            // Keep streaming as long as there is at least 1 item in queue
            stream(msg, servers, titles, connection);
        } else {
            // Make bot leave if queue has no item
            connection.disconnect();
        }
    });
}