"use strict";
class Constants {
    static init() {
        var file_reader = require('fs');
        var data_file = JSON.parse(file_reader.readFileSync('bot-settings.json', 'utf8'));
        Constants.Bot_Properties = data_file;
        Constants.Discord = require('discord.js');
        Constants.Bot = new Constants.Discord.Client();
    }
}
class Messenger {
    constructor() {
        Constants.Bot.on('ready', () => {
            console.log(`Logged in as ${Constants.Bot.user.tag}!`);
        });
        Constants.Bot.on('warn', (wrn) => {
            console.log(`warning: ${wrn}!`);
        });
    }
    all_channels_message_itterative_init() {
        var msg_index = 0;
        var msg_max = Constants.Bot_Properties["MESSAGELIST"].length;
        Constants.Bot.setInterval(() => {
            Constants.Bot.channels.forEach((chan) => {
                if (chan.type == "text") {
                    if (Constants.Bot_Properties["MESSAGELIST"][msg_index]["ATCH"] == "") {
                        chan.send(Constants.Bot_Properties["MESSAGELIST"][msg_index]["MSG"]);
                        console.log(Constants.Bot_Properties["MESSAGELIST"][msg_index]["MSG"]);
                    }
                    else {
                        var atch_ext_ind = Constants.Bot_Properties["MESSAGELIST"][msg_index]["ATCH"].lastIndexOf(".");
                        var atch = new Constants.Discord.Attachment(Constants.Bot_Properties["MESSAGELIST"][msg_index]["ATCH"], Date.now() + Constants.Bot_Properties["MESSAGELIST"][msg_index]["ATCH"].substr(atch_ext_ind));
                        var txt = Constants.Bot_Properties["MESSAGELIST"][msg_index]["MSG"];
                        chan.send(txt, atch);
                    }
                }
            });
            msg_index++;
            if (msg_index == msg_max) {
                msg_index = 0;
            }
        }, Constants.Bot_Properties["POSTTIMEOUT"]);
    }
    all_channels_voice_itterative_init() {
        var playing_in_chan = false;
        var channel_index = 0;
        var wait_init = 0;
        Constants.Bot.setInterval(() => {
            //get vox chan list
            var chan_list = Constants.Bot.channels.array();
            if (channel_index == chan_list.length) {
                channel_index++;
                wait_init = Date.now();
                return;
            }
            else if (channel_index > chan_list.length) {
                if (Constants.Bot_Properties["VOICETIMEOUT"] + wait_init < Date.now()) {
                }
                else
                    return;
            }
            // To play a file, we need to give an absolute path to it
            if (!playing_in_chan) {
                //set chan
                var channel = chan_list[channel_index++];
                if (channel == undefined) {
                    console.log("res");
                    channel_index = 0;
                    return;
                }
                while (channel.type != "voice") {
                    channel = chan_list[channel_index++];
                }
                console.log(channel_index, "===", channel.type);
                playing_in_chan = true;
                channel.join().then((connection) => {
                    var dispatcher = connection.playFile(Constants.Bot_Properties["VOICEFILE"]);
                    dispatcher.on('end', () => {
                        // The song has finished
                        console.log("Song Finished");
                        playing_in_chan = false;
                        connection.disconnect();
                    });
                    dispatcher.on('error', (e) => {
                        // Catch any errors that may arise
                        console.log(e);
                        playing_in_chan = false;
                    });
                    dispatcher.setVolume(0.5); // Set the volume back to 100%
                }).catch(console.log);
            }
        }, 100);
    }
    broadcast_voice_init() {
        Constants.Bot.setInterval(() => {
            var broadcast_stream = Constants.Bot.createVoiceBroadcast();
            broadcast_stream.playFile(Constants.Bot_Properties["VOICEFILE"]);
            Constants.Bot.channels.forEach((connection) => {
                console.log(connection.type);
                if (connection.type == "voice") {
                    connection.join();
                }
            });
            for (const connection of Constants.Bot.voiceConnections.values()) {
                console.log("connection");
                connection.playBroadcast(broadcast_stream);
            }
        }, Constants.Bot_Properties["VOICETIMEOUT"]);
    }
    message_channel_itterative_init(specified_channel) {
        var msg_index = 0;
        var msg_max = Constants.Bot_Properties["MESSAGELIST"].length;
        Constants.Bot.setInterval(() => {
            Constants.Bot.channels.forEach((chan) => {
                if (chan.type == "text" && chan.name == specified_channel) {
                    if (Constants.Bot_Properties["MESSAGELIST"][msg_index]["ATCH"] == "") {
                        chan.send(Constants.Bot_Properties["MESSAGELIST"][msg_index]["MSG"]);
                        console.log(Constants.Bot_Properties["MESSAGELIST"][msg_index]["MSG"]);
                    }
                    else {
                        var atch_ext_ind = Constants.Bot_Properties["MESSAGELIST"][msg_index]["ATCH"].lastIndexOf(".");
                        var atch = new Constants.Discord.Attachment(Constants.Bot_Properties["MESSAGELIST"][msg_index]["ATCH"], Date.now() + Constants.Bot_Properties["MESSAGELIST"][msg_index]["ATCH"].substr(atch_ext_ind));
                        var txt = Constants.Bot_Properties["MESSAGELIST"][msg_index]["MSG"];
                        chan.send(txt, atch);
                    }
                }
            });
            msg_index++;
            if (msg_index == msg_max) {
                msg_index = 0;
            }
        }, Constants.Bot_Properties["POSTTIMEOUT"]);
    }
    message_user_join_init() {
        // Create an event listener for new guild members
        Constants.Bot.on('guildMemberAdd', (member) => {
            // Send the message to a designated channel on a server:
            const channel = member.guild.channels.find((ch) => ch.name === Constants.Bot_Properties["NEWMEMBERCHANNEL"]);
            // Do nothing if the channel wasn't found on this server
            if (!channel)
                return;
            // Send the message, mentioning the member
            channel.send(Constants.Bot_Properties["MESSAGENEWMEMBER"] + " " + member);
        });
    }
    message_test_init() {
        Constants.Bot.on('message', (msg) => {
            if (msg.content === 'ping') {
                msg.reply(Constants.Bot_Properties["MESSAGE"]);
            }
        });
    }
    voice_test_init() {
        Constants.Bot.on('message', (message) => {
            // Voice only works in guilds, if the message does not come from a guild,
            // we ignore it
            if (!message.guild)
                return;
            if (message.content === '/join') {
                // Only try to join the sender's voice channel if they are in one themselves
                if (message.member.voiceChannel) {
                    message.member.voiceChannel.join()
                        .then((connection) => {
                        message.reply('I have successfully connected to the channel!');
                        // To play a file, we need to give an absolute path to it
                        const dispatcher = connection.playFile(Constants.Bot_Properties["VOICEFILE"]);
                        console.log(dispatcher);
                        dispatcher.on('end', () => {
                            // The song has finished
                            console.log("Song Finished");
                            console.log(dispatcher.time); // The time in milliseconds that the stream dispatcher has been playing for
                        });
                        dispatcher.on('error', (e) => {
                            // Catch any errors that may arise
                            console.log(e);
                            console.log(dispatcher.time); // The time in milliseconds that the stream dispatcher has been playing for
                        });
                        dispatcher.setVolume(0.5); // Set the volume to 50%
                        dispatcher.setVolume(1); // Set the volume back to 100%
                        // dispatcher.pause(); // Pause the stream
                        // dispatcher.resume(); // Carry on playing
                        // dispatcher.end(); // End the dispatcher, emits 'end' event
                    })
                        .catch(console.log);
                }
                else {
                    message.reply('You need to join a voice channel first!');
                }
            }
        });
    }
}
class Main {
    static init() {
        Constants.init();
        Constants.Bot.login(Constants.Bot_Properties["BOTTOKEN"]);
        // Constants.Bot.on("ready", this.activeInits);
        // Constants.Bot.on("resume", this.activeInits);
        this.activeInits();
    }
    static activeInits() {
        console.log("activeInits...");
        var messenger = new Messenger();
        // messenger.message_test_init();
        // messenger.broadcast_all_channels_message_itterative_init();
        //messenger.message_channel_itterative_init("general-a");
        // 
        //messenger.message_user_join_init();
        // messenger.voice_test_init();
        messenger.all_channels_voice_itterative_init();
    }
}
Main.init();
//# sourceMappingURL=verniy-bot.js.map