module.exports = {
    name: 'ping',
    alias: 'png',
    description: 'Returns latency stats',
    async execute(message, bot) {
        // credits: https://github.com/countr/countr/blob/master/commands/ping.js#L11-L42
        let botMsg = await message.channel.send("〽️ Pinging")
        botMsg.edit({ embed: {
            title: "📶 Pong",
            description: [
            "**Server**: `" + (botMsg.createdAt - message.createdAt) + "ms`"
            ].join("\n"),
            color: "2196f3",
            footer: { text: "Requested by " + message.author.tag, icon_url: message.author.displayAvatarURL },
            timestamp: new Date()
        }}).catch(() => botMsg.edit("🆘 An unknown error occurred. Do I have permission? (Embed Links)"));
    
        function msToTime (ms) {
            days = Math.floor(ms / 86400000); // 24*60*60*1000
            daysms = ms % 86400000; // 24*60*60*1000
            hours = Math.floor(daysms / 3600000); // 60*60*1000
            hoursms = ms % 3600000; // 60*60*1000
            minutes = Math.floor(hoursms / 60000); // 60*1000
            minutesms = ms % 60000; // 60*1000
            sec = Math.floor(minutesms / 1000);
            
            let str = "";
            if (days) str = str + days + "d";
            if (hours) str = str + hours + "h";
            if (minutes) str = str + minutes + "m";
            if (sec) str = str + sec + "s";
            
            return str;
        }
    }
}