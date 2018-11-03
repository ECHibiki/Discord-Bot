class Constants{
    static Discord:any;
    static Bot:any;
    static Bot_Properties:any;

    static init(){
        var file_reader = require('fs');
        var data_file = JSON.parse(file_reader.readFileSync('bot-settings.json', 'utf8'));
        Constants.Bot_Properties = data_file ;
        Constants.Discord = require('discord.js');
        Constants.Bot = new Constants.Discord.Client();
    }
}