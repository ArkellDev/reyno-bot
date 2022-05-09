import { CronJob } from 'cron';
import config from 'config';
import { client } from '../api/discord';
import { User } from '../models/User';

const cron = async () => {
    try {
        const guild = client.guilds.cache.get(config.get('MAIN_GUILD_ID'));
        guild.channels.cache.forEach(async (x) => {
            if (!x.isVoice()) return;
            if (x.members.size > 0) {
                x.members.forEach(async (x) => {
                    if (x.voice.selfDeaf || x.voice.selfMute) return;
                    (await User.findOneAndUpdate(
                        { id: x.id },
                        {
                            $inc: {
                                online: 60,
                                balance: 1,
                            },
                        },
                    )) ?? (await User.create({ id: x.id, online: 60 }));
                });
            }
        });
    } catch (e) {
        console.log(`Произошла ошибка при обработке крон задачи: voiceOnline`, `\`\`\`${e}\`\`\``);
    }
};

export default async (): Promise<void> => {
    new CronJob('* * * * *', cron, null, true, null, null, true);
    console.log(`Voice online checker started!`);
};
