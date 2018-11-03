class Main{
    static init (){
        Constants.init();
        Constants.Bot.login(Constants.Bot_Properties["BOTTOKEN"]);

        // Constants.Bot.on("ready", this.activeInits);

        // Constants.Bot.on("resume", this.activeInits);
        this.activeInits();
    }
    static activeInits():void{
        console.log("activeInits...");
        var messenger:Messenger = new Messenger();
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