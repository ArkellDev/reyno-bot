import { GuildMember, CommandInteraction, MessageAttachment, ButtonInteraction, Message } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { interactionButtonsCollector } from '../../collectors/interactionButtonsCollector';
import actionRows from '../../data/actionRows';
import embeds from '../../data/embeds';
import { IUser, User } from '../../models/User';
import getProfileCard from '../../utils/getProfileCard';
import getXpForLevel from '../../utils/getXpForLevel';
import messageCollector from '../../collectors/messageCollector';
import checkLink from '../../utils/checkLink';
import { IMarry, Marry } from '../../models/Marry';
import getLoveProfileImage from '../../utils/getLoveProfileImage';

@Discord()
class Profile {
    @Slash('профиль', { description: 'Показывает информацию о пользователе' })
    async profile(
        @SlashOption('user', { required: false, description: 'Пользователь' }) memberOption: GuildMember,
        interaction: CommandInteraction<'cached'>,
    ) {
        const member: GuildMember = memberOption || interaction.guild.members.cache.get(interaction.user.id);

        if (member.user.bot) {
            return interaction.reply({
                embeds: [embeds.badMessageNotification(interaction, 'Профиль', 'Боты не могут иметь профиль!')],
            });
        }

        let user = (await User.findOne({ id: member.id })) ?? (await User.create({ id: member.id }));

        const nextLevelXP: number = Math.floor(getXpForLevel(user.level + 1) - getXpForLevel(user.level));
        const currLevelXP: number = Math.floor(user.experience - getXpForLevel(user.level));
        const levelPercent: number = Math.floor((currLevelXP / nextLevelXP) * 100);

        let attachment = new MessageAttachment(await getProfileCard(member, user, levelPercent), `profile.png`);

        await interaction.reply({
            components: [actionRows.profileCard(interaction, member, user)],
            files: [attachment],
        });

        await interactionButtonsCollector(
            interaction.user,
            interaction,
            [`changeProfile`, `openLoveProfile`, `back`, `setBanner`, `resetBanner`],
            async (i: ButtonInteraction<'cached'>) => {
                switch (i.customId) {
                    case `changeProfile`:
                        await interaction.editReply({
                            embeds: [embeds.profileManage(member, user)],
                            components: [actionRows.profileManage(user)],
                            attachments: [],
                        });
                        break;

                    case `openLoveProfile`:
                        const marriageMember: GuildMember = interaction.guild.members.cache.get(user.married);
                        const marry: IMarry = await Marry.findOne({
                            users: {
                                $in: [member.id],
                            },
                        });

                        attachment = new MessageAttachment(
                            await getLoveProfileImage(member, marriageMember),
                            `love.png`,
                        );

                        await interaction.editReply({
                            embeds: [embeds.loveProfile(member, marriageMember, marry)],
                            files: [attachment],
                            attachments: [],
                        });
                        break;

                    case `resetBanner`:
                        user.background = '';
                        await user.save();

                        await i.reply({
                            ephemeral: true,
                            content: `Баннер успешно сброшен!`,
                        });

                        user = (await User.findOne({ id: member.id })) ?? (await User.create({ id: member.id }));
                        attachment = new MessageAttachment(
                            await getProfileCard(member, user, levelPercent),
                            `profile.png`,
                        );

                        await interaction.editReply({
                            embeds: [],
                            components: [actionRows.profileCard(interaction, member, user)],
                            files: [attachment],
                        });
                        break;

                    case `back`:
                        user = (await User.findOne({ id: member.id })) ?? (await User.create({ id: member.id }));
                        attachment = new MessageAttachment(
                            await getProfileCard(member, user, levelPercent),
                            `profile.png`,
                        );

                        await interaction.editReply({
                            embeds: [],
                            components: [actionRows.profileCard(interaction, member, user)],
                            files: [attachment],
                        });
                        break;

                    case `setBanner`:
                        await i.reply({
                            ephemeral: true,
                            content: 'Отправьте в чат ссылку или изображение баннера',
                        });

                        await messageCollector(interaction, async (message: Message) => {
                            if (message.attachments.size === 0) {
                                if (!checkLink(message.content)) {
                                    await i.reply({
                                        ephemeral: true,
                                        content: 'Не корекнтая ссылка на баннер!',
                                    });
                                    return;
                                }

                                user.background = message.content;
                                await user.save();

                                user = await User.findOne({ id: interaction.user.id });

                                await i.editReply({
                                    content: 'Баннер успешно изменен!',
                                });

                                await interaction.editReply({
                                    embeds: [embeds.profileManage(member, user)],
                                    components: [actionRows.profileManage(user)],
                                    attachments: [],
                                });
                            } else {
                                const attachment = message.attachments.first() as MessageAttachment;

                                if (!attachment.url) {
                                    await i.reply({
                                        ephemeral: true,
                                        content: 'Не удалось получить ссылку отправленого Вами изображение!',
                                    });
                                    return;
                                }

                                user.background = attachment.url;
                                await user.save();

                                await i.editReply({
                                    content: 'Баннер успешно изменен!',
                                });
                            }
                        });
                        break;
                }
            },
        );
    }
}
