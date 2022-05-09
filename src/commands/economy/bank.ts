import { CommandInteraction, ButtonInteraction, MessageAttachment, Message, GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import embeds from '../../data/embeds';
import actionRows from '../../data/actionRows';
import { BankCard } from '../../models/BankCard';
import config from 'config';
import { User } from '../../models/User';
import { interactionButtonsCollector } from '../../collectors/interactionButtonsCollector';
import BankCardNumberGenerator from '../../libs/bankCardGenerator';
import getBankCard from '../../utils/getBankCard';
import messageCollector from '../../collectors/messageCollector';

@Discord()
class Bank {
    @Slash('банк', { description: 'Управление банком' })
    async bank(
        @SlashOption('пользователь', { required: false, description: 'Пользователь' }) memberOption: GuildMember,
        interaction: CommandInteraction<'cached'>,
    ) {
        const member: GuildMember = memberOption || interaction.guild.members.cache.get(interaction.user.id);
        let user = (await User.findOne({ id: member.id })) ?? (await User.create({ id: member.id }));

        let mainBankCard = await BankCard.findOne({ id: member.id });

        if (!mainBankCard) {
            if (interaction.user.id !== member.id) {
                return interaction.reply({
                    embeds: [embeds.badMessageNotification(interaction, 'Банк', 'У пользователя нету карты!')],
                });
            }

            await interaction.reply({
                embeds: [
                    embeds.badMessageNotification(
                        interaction,
                        'Банк',
                        `На данный момент у Вас нету карточки банка **Reyno**. Вы можете создать её с помощью кнопки снизу, но за это Вам нужно будет заплатить **1000**${config.get<string>(
                            'COIN_EMOJI',
                        )}.`,
                    ),
                ],
                components: [actionRows.createBankCard(user)],
            });

            await interactionButtonsCollector(
                interaction.user,
                interaction,
                ['createCard'],
                async (i: ButtonInteraction<'cached'>) => {
                    switch (i.customId) {
                        case 'createCard':
                            mainBankCard = await BankCard.findOne({ id: interaction.user.id });

                            if (mainBankCard) {
                                return i.reply({
                                    ephemeral: true,
                                    content: 'У Вас уже есть карточка банка **Reyno**!',
                                });
                            }

                            await user.updateOne({ $inc: { balance: -1000 } });

                            const cardInfo = BankCardNumberGenerator.generate();

                            await BankCard.create({
                                id: interaction.user.id,
                                cardNumber: cardInfo[0],
                                expirationDate: cardInfo[1],
                                cvv: cardInfo[2],
                            });

                            await interaction.editReply({
                                embeds: [
                                    embeds.badMessageNotification(interaction, 'Банк', 'Карточка успешно создана!'),
                                ],
                                components: [],
                            });

                            await i.reply({
                                ephemeral: true,
                                content: 'Вы успешно создали карточку банка **Reyno**!',
                            });
                            break;
                    }
                },
            );
            return;
        }

        mainBankCard = await BankCard.findOne({ id: member.id });

        let pagination: number = 0;
        let attachment = new MessageAttachment(await getBankCard(mainBankCard), `card.png`);

        await interaction.reply({
            files: [attachment],
            components: interaction.user.id !== member.id ? [] : [actionRows.bankCardManage(mainBankCard)],
        });

        await interactionButtonsCollector(
            interaction.user,
            interaction,
            [
                'deposit',
                'withdraw',
                'transfer',
                'buyDesign',
                'resetDesign',
                'paginationBack',
                'paginationForward',
                'setStyle',
                'back',
            ],
            async (i: ButtonInteraction<'cached'>) => {
                if (i.customId === 'paginationBack') pagination--;
                if (i.customId === 'paginationForward') pagination++;

                switch (i.customId) {
                    case 'back':
                        mainBankCard = await BankCard.findOne({ id: interaction.user.id });

                        attachment = new MessageAttachment(await getBankCard(mainBankCard), `card.png`);

                        await interaction.editReply({
                            files: [attachment],
                            attachments: [],
                            components: [actionRows.bankCardManage(mainBankCard)],
                        });
                        break;

                    case 'paginationBack':
                    case 'paginationForward':
                        user = await User.findOne({ id: interaction.user.id });

                        attachment = new MessageAttachment(
                            `././assets/CardStyles/${await getStyle(pagination)}`,
                            `card_style${pagination}.png`,
                        );

                        await interaction.editReply({
                            attachments: [],
                            files: [attachment],
                            components: actionRows.stylesPagination(pagination, mainBankCard),
                        });
                        break;

                    case 'setStyle':
                        mainBankCard = await BankCard.findOneAndUpdate(
                            { id: interaction.user.id },
                            { style: await getStyle(pagination) },
                            { new: true },
                        );

                        await interaction.editReply({
                            attachments: [],
                            files: [attachment],
                            components: actionRows.stylesPagination(pagination, mainBankCard),
                        });
                        break;

                    case 'deposit':
                        await i.reply({
                            ephemeral: true,
                            content: 'Отправьте в чат сумму для пополнения баланса',
                        });

                        await messageCollector(interaction, async (msg: Message) => {
                            if (!Number(msg.content) || Number(msg.content) <= 0) {
                                return i.editReply({
                                    content: 'Указан не верный формат!',
                                });
                            }

                            user = await User.findOne({ id: interaction.user.id });

                            if (user.balance < Number(msg.content)) {
                                return i.editReply({
                                    content: 'У Вас недостаточно средств!',
                                });
                            }

                            await user.updateOne({ $inc: { balance: -Number(msg.content) } });
                            await mainBankCard.updateOne({ $inc: { balance: Number(msg.content) } });

                            mainBankCard = await BankCard.findOne({ id: interaction.user.id });

                            attachment = new MessageAttachment(await getBankCard(mainBankCard), `card.png`);

                            await interaction.editReply({
                                files: [attachment],
                                attachments: [],
                                components: [actionRows.bankCardManage(mainBankCard)],
                            });

                            await i.editReply({
                                content: 'Вы успешно пополнили баланс карты!',
                            });
                        });
                        break;

                    case 'withdraw':
                        await i.reply({
                            ephemeral: true,
                            content: 'Отправьте в чат сумму для снятия с баланса',
                        });

                        await messageCollector(interaction, async (msg: Message) => {
                            if (!Number(msg.content) || Number(msg.content) <= 0) {
                                return i.editReply({
                                    content: 'Указан не верный формат!',
                                });
                            }

                            mainBankCard = await BankCard.findOne({ id: interaction.user.id });

                            if (mainBankCard.balance < Number(msg.content)) {
                                return i.editReply({
                                    content: 'На карте недостаточно средств!',
                                });
                            }

                            await user.updateOne({ $inc: { balance: Number(msg.content) } });
                            await mainBankCard.updateOne({ $inc: { balance: -Number(msg.content) } });

                            mainBankCard = await BankCard.findOne({ id: interaction.user.id });

                            attachment = new MessageAttachment(await getBankCard(mainBankCard), `card.png`);

                            await interaction.editReply({
                                files: [attachment],
                                attachments: [],
                                components: [actionRows.bankCardManage(mainBankCard)],
                            });

                            await i.editReply({
                                content: 'Вы успешно сняли с баланса!',
                            });
                        });
                        break;

                    case 'transfer':
                        await i.reply({
                            ephemeral: true,
                            content: 'Отправьте в чат номер карты для перевода',
                        });

                        await messageCollector(interaction, async (msg: Message) => {
                            if (!Number(msg.content.replace(/\s+/g, ''))) {
                                return i.editReply({
                                    content: 'Неверный формат номера карты!',
                                });
                            }

                            const card = await BankCard.findOne({ cardNumber: msg.content.replace(/\s+/g, '') });

                            if (!card) {
                                return i.editReply({
                                    content: 'Карта не найдена!',
                                });
                            }

                            if (card.id === interaction.user.id) {
                                return i.editReply({
                                    content: 'Вы не можете переводить деньги самому себе!',
                                });
                            }

                            await i.editReply({
                                content: 'Отправьте в чат сумму перевода',
                            });

                            await messageCollector(interaction, async (msg: Message) => {
                                if (!Number(msg.content) || Number(msg.content) <= 0 || msg.content.includes('.')) {
                                    return i.editReply({
                                        content: 'Неверный формат суммы перевода!',
                                    });
                                }

                                if (Number(msg.content) > mainBankCard.balance) {
                                    return i.editReply({
                                        content: 'У Вас недостаточно средств!',
                                    });
                                }

                                await mainBankCard.updateOne({ $inc: { balance: -msg.content } });

                                await card.updateOne({ $inc: { balance: +msg.content } });

                                mainBankCard = await BankCard.findOne({ id: interaction.user.id });

                                attachment = new MessageAttachment(await getBankCard(mainBankCard), `card.png`);

                                await interaction.editReply({
                                    files: [attachment],
                                    attachments: [],
                                    components: [actionRows.bankCardManage(mainBankCard)],
                                });

                                await i.editReply({
                                    content: 'Перевод успешно выполнен!',
                                });
                            });
                        });
                        break;

                    case 'buyDesign':
                        attachment = new MessageAttachment(
                            `././assets/CardStyles/${await getStyle(pagination)}`,
                            `card_style${pagination}.png`,
                        );

                        await interaction.editReply({
                            files: [attachment],
                            attachments: [],
                            components: actionRows.stylesPagination(pagination, mainBankCard),
                        });
                        break;

                    case 'resetDesign':
                        mainBankCard = await BankCard.findOneAndUpdate(
                            { id: interaction.user.id },
                            { style: 'Default.png' },
                            { new: true },
                        );

                        attachment = new MessageAttachment(await getBankCard(mainBankCard), `card.png`);

                        await interaction.editReply({
                            files: [attachment],
                            attachments: [],
                            components: [actionRows.bankCardManage(mainBankCard)],
                        });
                        break;
                }
            },
        );
    }
}

async function getStyle(pagination: number): Promise<string> {
    const styles = ['FirstStyle.png', 'SecondStyle.png', 'ThirdStyle.png', 'FourthStyle.png', 'FifthStyle.png'];

    return styles[pagination];
}
