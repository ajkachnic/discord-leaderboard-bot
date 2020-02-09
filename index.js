const Discord = require('discord.js');
const dotenv = require('dotenv').config();
const fetch = require('node-fetch');
const keep_alive =require('./keep_alive')
const prefix = ";"

const client = new Discord.Client();
client.once("ready", () => {
    console.log('Ready');
});



client.login(process.env.TOKEN);
// client.on('message', message => {
client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    // the rest of your code
    if (command === "add") {
        if (message.member.hasPermission("MANAGE_ROLES")) {
            if (args.length != 2) {
                message.channel.send("Invalid Arguement Count\nUsage:\n`;add <user> <points>`")
            } else {
                if (!message.mentions.users.size) {
                    args[0] = "@" + args[0]
                    message.channel.send("Please mention a user")
                } else {

                    const body = {
                        id: message.mentions.users.first().id,
                        points: parseInt(args[1])
                    }
                    fetch('https://discord-leaderboard-api.herokuapp.com/add', {
                        method: "post",
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json',
                            "Key": process.env.KEY
                        },
                    }).catch(err => {
                        throw new Error(err)
                    })

                    await message.channel.send(`Added ${args[1]} points to ${args[0]}`)
                }
            }
        } else {
            message.channel.messages.find("id", message.id).delete()
            message.channel.send('You Don\'t Have The Permissions To Run This Command')
        }
    }
    if (command === "subtract") {
        if (message.member.hasPermission("MANAGE_ROLES")) {
            if (args.length != 2) {
                message.channel.send("Invalid Arguement Count\nUsage:\n`;subtract <user> <points>`")
            } else {
                if (!message.mentions.users.size) {
                    args[0] = "@" + args[0]
                    message.channel.send("Please mention a user")
                } else {

                    const body = {
                        id: message.mentions.users.first().id,
                        points: parseInt(args[1]) * -1
                    }
                    fetch('https://discord-leaderboard-api.herokuapp.com/add', {
                        method: "post",
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json',
                            "Key": process.env.KEY
                        },
                    }).catch(err => {
                        throw new Error(err)
                    })

                    await message.channel.send(`Subtracted ${args[1]} points to ${args[0]}`)
                }
            }
        } else {
            message.channel.messages.find("id", message.id).delete()
            message.channel.send('You Don\'t Have The Permissions To Run This Command')
        }
    }

    if (command === "set") {
        if (message.member.hasPermission("MANAGE_ROLES")) {

            if (args.length != 2) {
                message.channel.send("Invalid Arguement Count\nUsage:\n`;set <user> <points>`")
            } else {
                if (!message.mentions.users.size) {
                    args[0] = "@" + args[0]
                    message.channel.send("Please mention a user")
                } else {


                    const body = {
                        id: message.mentions.users.first().id,
                        points: parseInt(args[1])
                    }
                    fetch('https://discord-leaderboard-api.herokuapp.com/set', {
                        method: "post",
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json',
                            "Key": process.env.KEY
                        },
                    }).catch(err => {
                        throw new Error(err)
                    })

                    await message.channel.send(`Set ${args[0]} to ${args[1]} points`)

                }
            }
        } else {
            message.channel.messages.find("id", message.id).delete()
            message.channel.send('You Don\'t Have The Permissions To Run This Command')
        }
    }
    if (command === "rank") {
        fetch('https://discord-leaderboard-api.herokuapp.com/users', {
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                    "Key": process.env.KEY
                },
            }).then(res => res.json()).then(json => {
                const winners = json.map(i => {
                    return `@${message.guild.members.find("id",i.userid).nickname || message.guild.members.find("id",i.userid).user.username} - ${i.points}`
                })
                let betterWinners = `
                🥇 ${ winners[0] || "No one yet"}
                🥈 ${ winners[1] || "No one yet"}
                🥉 ${ winners[2] || "No one yet"}
                ${winners.slice(3).join("\n")}
                `
                let embed = new Discord.RichEmbed(winners)
                    .setColor("#2da3f0")
                    .setDescription(betterWinners)
                    .setAuthor("@" + message.author.username)
                    .setTitle("Programming Challenge Rankings")
                    .setFooter("A Code Army Project")
                message.channel.send(embed)
            })
            .catch(err => {
                throw new Error(err)
            })
    }
    if (command === "user") {
        let id;
        if (!message.mentions.users.size) {
            id = message.author.id
        } else {
            id = message.mentions.users.first().id
        }
        const body = {
            id: id
        }

        fetch('https://discord-leaderboard-api.herokuapp.com/user', {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    "Key": process.env.KEY
                },
                body: JSON.stringify(body)
            }).then(res => res.json()).then(json => {
                let user;
                if (json) {
                    user = `${message.guild.members.find("id",json["userid"]).nickname || message.guild.members.find("id",json.userid).user.username} - ${json.points} points`
                } else {
                    user = `User Not In Database (yet)`
                }

                let embed = new Discord.RichEmbed()
                    .setColor("#2da3f0")
                    .setDescription(user)
                    .setTitle("User Stats")
                    .setFooter("A Code Army Project")
                message.channel.send(embed)
            })
            .catch(err => {
                throw new Error(err)
            })

    }
    if (command === "help") {
        let help = `
        **User Commands**
        \`rank\` - Show The Rankings
        \`user\` - Show A Users Point Total

        **Staff Commands**
        \`set\` - Set a user's score
        \`add\` - Add points to a user's score
        \`subtract\` - Subtract points to a user's score


        **Sudo Commands**
        \`nuke\` - Deletes all entries in the database
        `
        let embed = new Discord.RichEmbed()
            .setColor("#2da3f0")
            .setTitle("Coding Leaderboard Help")
            .setDescription(help)
            .setFooter("A Code Army Project")
        message.channel.send(embed)
    }

    if (command === "nuke") {
        if (message.member.hasPermission("ADMINISTRATOR")) {
            fetch('https://discord-leaderboard-api.herokuapp.com/remove', {
                method: 'delete',
                headers: {
                    "Key": process.env.KEY
                }
            }).then(() => message.channel.send("Nuked Rankings"))
        } else {
            message.channel.messages.find("id", message.id).delete()
            message.channel.send('You Don\'t Have The Permissions To Run This Command')
        }
    }
})