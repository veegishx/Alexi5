const got = require('got');
module.exports = function amazeme(msg) {
    got('https://www.reddit.com/r/interestingasfuck/random.json').then(response => {
        let content = JSON.parse(response.body);
        var title = content[0].data.children[0].data.title;
        var amazeme = content[0].data.children[0].data.url;
        msg.channel.send('**' + title + '**');
        msg.channel.send(amazeme)
        .then(sent => console.log(`Sent a reply to ${sent.author.username}`))
    }).catch(console.error);
}