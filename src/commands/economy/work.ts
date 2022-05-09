import { Discord, Slash } from 'discordx';
import { CommandInteraction } from 'discord.js';
import { User } from '../../models/User';
import moment from 'moment';
import embeds from '../../data/embeds';
import getRandomArbitrary from '../../utils/getRandomArbitrary';
import worksList from '../../data/worksList';
import actionRows from '../../data/actionRows';

@Discord()
class Work {
    @Slash('работа', { description: 'Начать свою смену на работе' })
    async work(interaction: CommandInteraction<'cached'>) {
        const user =
            (await User.findOne({ id: interaction.user.id })) ?? (await User.create({ id: interaction.user.id }));

        if (user.last_work > moment().unix() - 86400) {
            return interaction.reply({
                embeds: [
                    embeds.badMessageNotification(
                        interaction,
                        'Работа',
                        'Вы уже начали свою смену за последние 24 часа!',
                    ),
                ],
            });
        }

        const randomCoinsCount: number = getRandomArbitrary(150, 300);
        const randomWorkName: number = Math.floor(Math.random() * worksList.length);

        await user.updateOne({
            $inc: { balance: randomCoinsCount },
            last_work: moment().unix(),
        });

        await interaction.reply({
            embeds: [embeds.work(user, worksList[randomWorkName], randomCoinsCount)],
            components: [actionRows.earningOffer()],
        });
    }
}
