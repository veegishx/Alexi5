const Discord = require('discord.js');
const got = require("got");


module.exports = {
    name: 'reddit',
    alias: 'rdt',
    description: 'Returns a random content from a specified reddit.com. If no subreddit is specified then return random content from a random subreddit',
    execute(message, args) {
        const subreddit = args.shift();

        let url = ``;
        if(subreddit == null) {
            url = `https://www.reddit.com/r/random/.json`;
        } else {
            url = `https://www.reddit.com/r/${subreddit}/random/.json`;
        }

        try {
            got(url).then(response => {
                    try {
                        const content = JSON.parse(response.body);
                        const postType = content[0].data.children[0].data.post_hint;
                        const permalink = content[0].data.children[0].data.permalink;
                        const memeUrl = `https://reddit.com${permalink}`;
                        const memeImage = content[0].data.children[0].data.url;
                        const memeTitle = content[0].data.children[0].data.title;
                        const memeUpvotes = content[0].data.children[0].data.ups;
                        const memeNumComments = content[0].data.children[0].data.num_comments;
                        if(postType == "rich:video") {
                            const videoUrl = content[0].data.children[0].data.url_overridden_by_dest;
                            message.channel.send(videoUrl);
                        } else {
                            const embed = new Discord.RichEmbed();
                            embed.addField(`${memeTitle}`, `[View thread](${memeUrl})`);
                            embed.setImage(memeImage);
                            embed.setFooter(`👍 ${memeUpvotes} 💬${memeNumComments}`);
                            message.channel.send(embed);
                        }
                    } catch (err) {
                        console.log(`URL: ${url}:`);
                        console.log(`${err.name}: ${err.message}`);
                        message.channel.send("Meme machine goes brrr. Sorry, could not fetch a meme from this subreddit :(");
                    }
            });
        } catch(err) {
            console.log(`URL: ${url}:`);
            console.log(`${err.name}: ${err.message}`);
            message.channel.send("I'm currently having trouble working with reddit. Please try again later.");
        }
    }
}