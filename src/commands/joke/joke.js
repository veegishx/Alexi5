const got = require('got');
module.exports = function joke(msg) {
    got('https://www.reddit.com/r/jokes/random/.json').then(response => {
        let content = JSON.parse(response.body);
        var title = content[0].data.children[0].data.title;
        var joke = content[0].data.children[0].data.selftext;
        msg.channel.send('**' + title + '**');
        msg.channel.send(joke)
        .then(sent => console.log(`Sent a reply to ${sent.author.username}`))
    }).catch(console.error);
}