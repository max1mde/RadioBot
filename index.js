const { Client } = require("discord.js-selfbot-v13");
const DjsVoice = require("@discordjs/voice");
const Discord = require("discord.js-selfbot-v13");

const config = require("./config.json");

const channel = config.channelID;

const client = new Client({
    patchVoice: true,
    checkUpdate: false,
    syncStatus: false,
});

client.on("ready", async () => {
    console.log("The bot is ready! Account: " + client.user.tag)
    const voiceChannel = client.channels.cache.get(channel);

    console.log("Creating player...");
    const player = DjsVoice.createAudioPlayer({
        behaviors: {
            noSubscriber: DjsVoice.NoSubscriberBehavior.Play,
        },
    });

    if (!voiceChannel) {
        console.error("Voice channel not found. Please check the channel ID.");
        return;
    }

    console.log("Found channel: " + voiceChannel.name);

    console.log("Joining voice channel...");

    await joinVC(voiceChannel, player)

    createRadioStream(config.streamURL, player);
});

function createRadioStream(url, player) {
    console.log("Playing radio...");
    const resource = DjsVoice.createAudioResource(url, {
        inputType: DjsVoice.StreamType.Arbitrary,
        inlineVolume: true,
    });
    resource.volume.setVolume((config.volume / 100).toFixed(2));
    player.play(resource);
}

async function joinVC(channel, player) {
    if (channel instanceof Discord.VoiceChannel) {
        const connection = DjsVoice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        await DjsVoice.entersState(
            connection,
            DjsVoice.VoiceConnectionStatus.Ready,
            10_000
        );
        connection.subscribe(player);
    } else if (channel instanceof Discord.StageChannel) {
        const connection = DjsVoice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: this.guild.voiceAdapterCreator,
        });
        await DjsVoice.entersState(
            connection,
            DjsVoice.VoiceConnectionStatus.Ready,
            10_000
        );
        connection.subscribe(player);
        await channel.guild.members.me.voice
            .setSuppressed(false)
            .catch(async () => {
                return await this.channel.guild.members.me.voice.setRequestToSpeak(
                    true
                );
            });
    } else {
        const connection =
            channel.voiceConnection || (await channel.call());
        connection.subscribe(player);
    }
}

client.login(config.token);