import { Message, MessageCollector } from 'discord.js';
import Logger from '../libs/logger';

export default async (msg, collect) => {
    const collector = new MessageCollector(msg.channel, {
        filter: (m) => m.author.id === msg.member.id,
        time: 60 * 1000,
    });

    collector.on('collect', async (message: Message) => {
        try {
            if (message && !message.deleted) await message.delete();
            await collect(message);
            await collector.stop();
        } catch (e) {
            await collector.stop();
            console.log(`Произошла ошибка при обработке коллектора: messageCollector`, `\`\`\`${e}\`\`\``);
        }
    });
};
