module.exports = {
    name: 'fact',
    alias: 'fct',
    description: 'Returns a random useless fact',
    execute(message, args, dependencies) {
        const [Discord, got] = dependencies;
        switch(args[0]) {
            case null:
                option = "random";
                break;
            case "today":
                option = "today";
                break;
            default:
                option = "random";
        }

        const url = `https://uselessfacts.jsph.pl/${option}.json?language=en`;

        try {
            got(url).then(response => {
                try {
                    const data = JSON.parse(response.body);
                    const embed = new Discord.MessageEmbed();
                    
                    if(option == "random") {
                        embed.setDescription(`${data.text}`);
                        embed.setTitle("Here's a useless fact...");
                        embed.setColor("RANDOM");
                        message.channel.send(embed);
                    } else {
                        embed.setDescription(`${data.text}`);
                        embed.setTitle("Fact of the day...");
                        embed.setColor("BLUE");
                        message.channel.send(embed);
                    }
                } catch(err) {
                    message.channel.send("Can't look up facts. Try correctly specifying whether you want a `random` or `daily` fact.");
                }
            }).catch(console.error);
        } catch(err) {
            message.channel.send("I'm currently having trouble looking up facts. Please try again later.");
        }
    }
}