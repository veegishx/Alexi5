const got = require('got');
module.exports = function nsfw(msg) {
    got('https://www.reddit.com/r/nsfw/random/.json').then(response => {
        let content = JSON.parse(response.body);
        var image = content[0].data.children[0].data.url;
        msg.channel.send(image)
            .then(sent => console.log(`Sent a reply to ${sent.author.username}`))
        console.log('[NSFW] Bot responded with: ' + image);
    }).catch(console.error);
}