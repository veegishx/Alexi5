module.exports = {
    name: 'ping',
    alias: 'png',
    description: 'Returns Pong',
    execute(message, args) {
        message.channel.send('Pong!');
    }
}