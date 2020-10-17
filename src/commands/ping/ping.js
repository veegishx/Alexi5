module.exports = {
    name: 'ping',
    alias: 'png',
    description: 'Returns Pong',
    execute(message) {
        message.channel.send('Pong!');
    }
}