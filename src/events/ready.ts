import { Guild } from 'discord.js';
import { Client } from 'discordx';
import config from 'config';
import getNoun from '../utils/getNoun';

export default async (client: Client) => {
    await client.guilds.fetch();

    await client.initApplicationCommands({
        guild: { log: true },
        global: { log: true },
    });

    const mainGuild: Guild = client.guilds.cache.get(config.get<string>('MAIN_GUILD_ID'));

    client.user.setActivity(
        `${mainGuild.memberCount} ${getNoun(mainGuild.memberCount, 'участник', 'участника', 'участников')}`,
        {
            type: 'STREAMING',
            url: 'https://twitch.tv/dankmemer',
        },
    );
};
