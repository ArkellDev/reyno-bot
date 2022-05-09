import { CommandInteraction, SelectMenuInteraction, User, Message } from 'discord.js';
import Logger from '../libs/logger';

export const interactionSelectMenuCollector = async (
    author: User,
    interaction: CommandInteraction | SelectMenuInteraction,
    filters: string[],
    collect,
    end = null,
) => {
    const filter = async (i: SelectMenuInteraction) => {
        return filters.some((x) => x === i.customId && i.user.id === author.id);
    };

    const message = (await interaction.fetchReply()) as Message;

    const collector = await message.createMessageComponentCollector({
        filter,
        time: 240 * 1000,
    });

    collector.on('collect', async (i: SelectMenuInteraction) => {
        try {
            await collector.resetTimer();
            await collect(i, collector);
            if (!i.replied && !i.deferred) await i.deferUpdate();
        } catch (e) {
            console.log(
                `Произошла ошибка при обработке коллектора: interactionSelectMenuCollector`,
                `\`\`\`${e}\`\`\``,
            );
        }
    });

    // collector.on('end', async () => {
    //     if (!end) {
    //         if (!message.deleted) await message.delete();
    //         return;
    //     }
    //     await end();
    // });
};
