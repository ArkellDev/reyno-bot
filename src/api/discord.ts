import { Intents, MessageOptions, Interaction } from 'discord.js';
import config from 'config';
import ready from '../events/ready';
import { Client } from 'discordx';
import { importx } from '@discordx/importer';
import path from 'path';

export const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
    botGuilds: [config.get('MAIN_GUILD_ID')],
});

export const sendWhisper = async (id: string, message: string | MessageOptions): Promise<void> => {
    try {
        const user = await client.users.fetch(id);
        await user.send(message);
    } catch (e) {
        console.log('Ошибка при попытке отправить личное сообщение: ', e);
    }
};

export const run = async () => {
    await importx(path.resolve('./{src,dist}/commands/') + '/**/*.{ts,js}');
    await client.login(config.get<string>('DISCORD_TOKEN'));
    console.log('Discord connected!');
};

client.on('interactionCreate', (interaction: Interaction) => {
    client.executeInteraction(interaction);
});

client.on('ready', ready);
