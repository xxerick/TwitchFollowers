const fetch = require('node-fetch'),
    fs = require('fs'),
    Discord = require('discord.js'),
    request = require('request'),
    client = new Discord.Client(),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    admins = ["yourid", "yourid", "yourid"],
    config = {
        "yourroleid": 1500,
        "yourroleid": 75,
        "yourroleid": 50,
        "yourroleid": 20,
        "yourroleid": 10,
        "yourroleid": 5
    }

var tokens = fs.readFileSync('./tokens.txt', 'utf-8');
tokens = tokens.split("\n")

client.on('ready', async () => {
    console.log(`${client.user.tag} is ready !`)
    console.log(`Loaded ${tokens.length} tokens !`)
})

client.on('message', async (message) => {
    const prefix = "/";

    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === "help") {
        message.channel.send(new Discord.MessageEmbed()
            .addFields({
                name: "Followers Booster",
                value: `\`${prefix}tfollow <twitch username>\``,
                inline: true
            }, {
                name: "Help Page",
                value: `\`${prefix}help\``,
                inline: true
            }, {
                name: "Bot Latency",
                value: `\`${prefix}ping\``,
                inline: true

            }, {
                name: "Nuke (Mod Only)",
                value: `\`${prefix}nuke\``,
                inline: true

            }, {
                name: "Eval (Mod Only)",
                value: `\`${prefix}eval <code>\``,
                inline: true

            })
            .setColor("GREEN")
            .setFooter(message.guild.name, message.guild.iconURL({
                dynamic: true
            }))
        )
    }
    if (command === "ping") {
        message.channel.send(new Discord.MessageEmbed()
            .setDescription(`My ping is **${client.ws.ping}ms** !`)
            .setColor("GREEN")
            .setFooter(message.guild.name, message.guild.iconURL({
                dynamic: true
            }))
        )
    }
    if (command === "nuke") {
        const position = message.channel.position
        const channel = await message.channel.clone();
        message.channel.delete();
        channel.setPosition(position)
    }
    if (command === "eval" && admins.includes(message.author.id)) {
        const content = message.content.split(" ").slice(1).join(" ");
        const result = new Promise(async (resolve) => resolve(eval(content)));

        return result.then(async (output) => {
            if (typeof output !== "string") {
                output = require("util").inspect(output, {
                    depth: 0
                });
            }
            if (output.includes(client.token)) {
                output = output.replace(client.token, "T0K3N");
            }
            message.channel.send(output, {
                code: "js"
            });
        }).catch((err) => {
            err = err.toString();
            if (err.includes(client.token)) {
                err = err.replace(client.token, "T0K3N");
            }
            message.channel.send(err, {
                code: "js"
            });
            console.log(err)
        });
    }
    if (command === "tfollow") {
        let twitchID = "";

        if (admins.includes(message.author.id)) {

            if (!args[0]) return message.channel.send(new Discord.MessageEmbed().setColor('RED').setDescription("You must specify a twitch username !"))

            var roleID = Object.entries(config).find(([key, value]) => message.member.roles.cache.sort((a, b) => a.position - b.position).find(x => x.id === key))

            if (!roleID) roleID = [null, 0]

            await getUser(args[0]).then((res) => {
                if (res._total === 0) {
                    return message.channel.send(new Discord.MessageEmbed().setColor('RED').setDescription("You must specify **valid** a twitch username !"))
                } else {
                    twitchID = res.users[0]._id
                }
            })

            let number = args[1] ? parseInt(args[1]) : roleID[1] + 25
            follow(twitchID, number).then((cool) => {
                const channel = client.channels.cache.find(c => c.name === "proofs");
                if (channel) channel.send(new Discord.MessageEmbed().setColor("GREEN").setAuthor(message.author.username, message.author.displayAvatarURL({
                    format: 'png',
                    dynamic: true,
                    size: 1024
                }))
                    .setFooter(message.guild.name, message.guild.iconURL({
                        dynamic: true
                    }))
                    .setDescription(`Successfully added **${number}** followers to \`${args[0]}\` (Twitch ID: \`${twitchID}\`)\n\nCheck out [${args[0]}'s twitch channel](https://twitch.tv/${args[0]}/)`)).then((msg) => {
                        msg.react("<:verified:825762203419541524>")
                    })
            })
            message.channel.send(new Discord.MessageEmbed().setColor('GREEN').setDescription(`Adding **${number}** followers to \`${args[0]}\` !`))
        } else if (!admins.includes(message.author.id)) {

            if (message.channel.id === client.channels.cache.find(c => c.name === "chat").id) return message.delete();

            var roleID = Object.entries(config).find(([key, value]) => message.member.roles.cache.sort((a, b) => a.position - b.position).find(x => x.id === key))

            if (!args[0]) return message.channel.send(new Discord.MessageEmbed().setColor('RED').setDescription("You must specify a twitch username !"))

            let number = 25

            if (roleID) {
                number = number + roleID[1]
            }

            await getUser(args[0]).then((res) => {
                if (res._total === 0) {
                    return message.channel.send(new Discord.MessageEmbed().setColor('RED').setDescription("You must specify **valid** a twitch username !"))
                } else {
                    twitchID = res.users[0]._id
                }
            })

            message.channel.send(new Discord.MessageEmbed().setColor('GREEN').setDescription(`Adding **${number}** followers to \`${args[0]}\` !`))

            follow(twitchID, number).then((cool) => {
                const channel = client.channels.cache.find(c => c.name === "proofs");
                if (channel) channel.send(new Discord.MessageEmbed().setColor("GREEN").setAuthor(message.author.username, message.author.displayAvatarURL({
                    format: 'png',
                    dynamic: true,
                    size: 1024
                }))
                    .setFooter(message.guild.name, message.guild.iconURL({
                        dynamic: true
                    }))
                    .setDescription(`Successfully added **${number}** followers to \`${args[0]}\` (Twitch ID: \`${twitchID}\`)\n\nCheck out [${args[0]}'s twitch channel](https://twitch.tv/${args[0]}/)`)).then((msg) => {
                        msg.react("<:verified:825762203419541524>")
                    })
            })
        }
    }
})

function getUser(username) {
    return fetch(`https://api.twitch.tv/kraken/users?login=${username}`, {
        method: "GET",
        headers: {
            'Client-ID': "ymd9sjdyrpi8kz8zfxkdf5du04m649",
            "Authorization": "OAuth wukbrnwp5f6uo4barxkzfpkacyugob",
            'Accept': 'application/vnd.twitchtv.v5+json'
        }
    }).then(async (res) => res.json())
};

async function follow(twitchID, number) {
    return new Promise(async (resolve, reject) => {
        let done = 0
        for (var i = 0; i < number; i++) {
            let res = await sendRequest(twitchID, tokens[i]);
            done++
        }

        while (i === number) {
            return resolve(true)
        }
    })

}

async function sendRequest(userid, token) {
    return new Promise(async (resolve, reject) => {
        var data = `[{"operationName":"FollowButton_FollowUser","variables":{"input":{"disableNotifications":false,"targetID":"` + userid + `"}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"3efee1acda90efdff9fef6e6b4a29213be3ee490781c5b54469717b6131ffdfe"}}}]
    `;

        const options = {
            url: 'https://gql.twitch.tv/gql',
            headers: {
                "Authorization": 'OAuth ' + token,
                "Client-Id": 'kimne78kx3ncx6brgo4mv6wki5h1ko',
                "Content-Type": "application/json"
            },
            body: data
        };

        request.post(options, (err, res, body) => {
            if (err) {
                return console.log(`Invalid token try with another tokens like tyogihfp9rueyo7vt4ple2wlihmlic`);
            }
            console.log(JSON.parse(body));
            resolve(true)
        });
    })
}

client.on("guildMemberAdd", async (member) => {
    const channels = ["rewards", "farm-twitch"]

    for (let i = 0; i < channels.length; i++) {
        const channel = client.channels.cache.find(c => c.name === channels[i])
        if (channel) channel.send(`${member}, **Check out this channel !**`).then(async (msg) => {
            msg.delete({
                timeout: 5000
            })
        })
    }
})

client.login("Token")
