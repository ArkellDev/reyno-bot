import { MessageActionRow, MessageButton, MessageSelectMenu, CommandInteraction, GuildMember } from 'discord.js';
import 'moment/locale/ru';
import { IUser } from '../models/User';
import config from 'config';
import { IBankCard } from '../models/BankCard';

export default {
    profileCard(interaction: CommandInteraction, member: GuildMember, user: IUser) {
        const changeProfile = new MessageButton()
            .setCustomId('changeProfile')
            .setEmoji('🔧')
            .setLabel('Изменить профиль')
            .setDisabled(interaction.user.id !== member.user.id)
            .setStyle('SECONDARY');

        const openLoveProfile = new MessageButton()
            .setCustomId('openLoveProfile')
            .setEmoji('💗')
            .setLabel('Любовный профиль')
            .setDisabled(user.married === '')
            .setStyle('SUCCESS');

        return new MessageActionRow().addComponents(changeProfile, openLoveProfile);
    },

    profileManage(user: IUser, disabled = false) {
        const back = new MessageButton()
            .setCustomId('back')
            .setEmoji('⬅')
            .setLabel('Назад')
            .setDisabled(disabled)
            .setStyle('SECONDARY');

        const setBanner = new MessageButton()
            .setCustomId('setBanner')
            .setEmoji('🖼')
            .setLabel('Установить баннер')
            .setDisabled(disabled)
            .setStyle('PRIMARY');

        const resetBanner = new MessageButton()
            .setCustomId('resetBanner')
            .setEmoji('🗑')
            .setLabel('Сбросить баннер')
            .setDisabled(user.background === '')
            .setStyle('DANGER');

        return new MessageActionRow().addComponents(back, setBanner, resetBanner);
    },

    earningOffer(disabled = false) {
        const earningOffer = new MessageButton()
            .setEmoji(config.get<string>('COIN_EMOJI'))
            .setLabel('Хотите зарабатывать больше?')
            .setURL(config.get<string>('BOOST_ROLE_INFO'))
            .setDisabled(disabled)
            .setStyle('LINK');

        return new MessageActionRow().addComponents(earningOffer);
    },

    createBankCard(user: IUser) {
        const createCard = new MessageButton()
            .setCustomId('createCard')
            .setEmoji(user.balance >= 1000 ? '💳' : config.get<string>('COIN_EMOJI'))
            .setLabel(user.balance >= 1000 ? 'Создать карточку' : `${user.balance}/1000`)
            .setDisabled(user.balance < 1000)
            .setStyle(user.balance < 1000 ? 'DANGER' : 'PRIMARY');

        return new MessageActionRow().addComponents(createCard);
    },

    bankCardManage(bankCard: IBankCard, disabled = false) {
        const deposit = new MessageButton()
            .setCustomId('deposit')
            .setEmoji('➕')
            .setLabel('Пополнить карту')
            .setDisabled(disabled)
            .setStyle('PRIMARY');

        const withdraw = new MessageButton()
            .setCustomId('withdraw')
            .setEmoji('➖')
            .setLabel('Вывести средства')
            .setDisabled(disabled)
            .setStyle('PRIMARY');

        const transfer = new MessageButton()
            .setCustomId('transfer')
            .setEmoji('💳')
            .setLabel('Перевести средства')
            .setDisabled(disabled)
            .setStyle('PRIMARY');

        const buyDesign = new MessageButton()
            .setCustomId('buyDesign')
            .setEmoji('🖼')
            .setLabel('Выбрать дизайн')
            .setDisabled(disabled)
            .setStyle('PRIMARY');

        const resetDesign = new MessageButton()
            .setCustomId('resetDesign')
            .setEmoji('🗑')
            .setLabel('Сбросить дизайн')
            .setDisabled(bankCard.style === 'Default.png')
            .setStyle('DANGER');

        return new MessageActionRow().addComponents(deposit, withdraw, transfer, buyDesign, resetDesign);
    },

    stylesPagination(pagination: number, bankCard: IBankCard) {
        enum StylesNumber {
            'FirstStyle.png' = 0,
            'SecondStyle.png' = 1,
            'ThirdStyle.png' = 2,
            'FourthStyle.png' = 3,
            'FifthStyle.png' = 4,
        }

        const paginationBack = new MessageButton()
            .setCustomId('paginationBack')
            .setEmoji('⬅')
            .setDisabled(pagination === 0)
            .setStyle('SECONDARY');

        const setStyle = new MessageButton()
            .setCustomId('setStyle')
            .setLabel('Применить')
            .setDisabled(StylesNumber[bankCard.style] === pagination)
            .setStyle('PRIMARY');

        const paginationForward = new MessageButton()
            .setCustomId('paginationForward')
            .setEmoji('➡')
            .setDisabled(pagination === 4)
            .setStyle('SECONDARY');

        const back = new MessageButton().setCustomId('back').setLabel('Назад').setStyle('SECONDARY');

        return [
            new MessageActionRow().addComponents(paginationBack, setStyle, paginationForward),
            new MessageActionRow().addComponents(back),
        ];
    },
};
