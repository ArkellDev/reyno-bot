import moment from 'moment';
import {
    MessageEmbed,
    GuildMember,
    Interaction,
    CommandInteraction,
    ButtonInteraction,
    SelectMenuInteraction,
} from 'discord.js';
import 'moment/locale/ru';
import { IUser } from '../models/User';
import { IMarry } from '../models/Marry';

moment.locale('ru');

export default {
    profileManage(member: GuildMember, user: IUser) {
        const embed = new MessageEmbed();

        embed.setTitle(`Управление профилем — ${member.user.tag}`);
        embed.setDescription(
            `Для того чтобы установить баннер, воспользуйтесь кнопкой снизу.\n` + `\`\`\`Баннер\`\`\``,
        );
        embed.setColor('#2f3136');
        embed.setImage(user.background);
        embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

        return embed;
    },

    badMessageNotification(
        interaction: Interaction | CommandInteraction | ButtonInteraction | SelectMenuInteraction,
        name: string,
        reason: string,
    ) {
        const embed = new MessageEmbed();

        embed.setTitle(name);
        embed.setDescription(reason);
        embed.setColor('#2f3136');
        embed.setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        return embed;
    },

    work(user: IUser, workName: string, count: number) {
        let fixCount: number = user.balance + count;

        const embed = new MessageEmbed();

        embed.setTitle('Работа');
        embed.setDescription(
            `Вы успешно поработали **${workName}**, и по итогу заработали **${count.toFixed(
                0,
            )}** монет.\nВаш баланс составляет **${fixCount.toFixed(0)}** монет.`,
        );
        embed.setColor('#2f3136');

        return embed;
    },

    loveProfile(member: GuildMember, marriageMember: GuildMember, loveRoom: IMarry) {
        const duration = moment.duration(loveRoom.online * 1000);
        const hours = `${duration.hours()}`;
        const minutes = `${duration.minutes()}`;

        const hoursInSeconds = duration.hours() * 3600;
        const minutesInSeconds = duration.minutes() * 60;

        const days = `${(loveRoom.online - hoursInSeconds - minutesInSeconds) / 86400}`;

        const embed = new MessageEmbed();

        embed.setTitle(`Любовный профиль — ${member.user.tag}`);
        embed.setFields(
            {
                name: '> Пара:',
                value: `\`\`\`${member.user.tag} & ${marriageMember.user.tag}\`\`\``,
                inline: false,
            },

            {
                name: '> Парный онлайн:',
                value: `\`\`\`${days}д. ${hours}ч. ${minutes}м.\`\`\``,
                inline: true,
            },

            {
                name: '> Баланс пары:',
                value: `\`\`\`${loveRoom.balance.toFixed(0)}$\`\`\``,
                inline: true,
            },

            {
                name: '> Оплачена до:',
                value: `\`\`\`${moment.unix(loveRoom.last_payment).format('LLL')}\`\`\``,
                inline: false,
            },
        );
        embed.setColor('#2f3136');
        embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
        embed.setImage(`attachment://love.png`);

        return embed;
    },
};
