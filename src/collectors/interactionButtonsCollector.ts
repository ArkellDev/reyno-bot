import { ButtonInteraction, User, CommandInteraction, Message } from 'discord.js';
import Logger from '../libs/logger';

export const interactionButtonsCollector = async (
    author: User,
    interaction: CommandInteraction | ButtonInteraction,
    filters: string[],
    collect,
    end = null,
) => {
    const filter = async (i: ButtonInteraction) => {
        return filters.some((x) => x === i.customId && i.user.id === author.id);
    };

    const message = (await interaction.fetchReply()) as Message;

    const collector = await message.createMessageComponentCollector({
        filter,
        time: 240 * 1000,
    });

    collector.on('collect', async (i: ButtonInteraction) => {
        try {
            await collector.resetTimer();
            await collect(i, collector);
            if (!i.replied && !i.deferred) await i.deferUpdate();
        } catch (e) {
            console.log(`Произошла ошибка при обработке коллектора: interactionButtonsCollector`, `\`\`\`${e}\`\`\``);
        }
    });

    collector.on('end', async () => {
        if (!end) {
            await interaction.editReply({
                components: [],
            });
            return;
        }
        await end();
    });
};
