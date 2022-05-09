import config from 'config';
import { MessageEmbed, TextChannel } from 'discord.js';
import { client } from '../api/discord';

export default class Logger {
    private static guildId: string = config.get<string>('LOG_GUILD_ID');
    private static channelId: string = config.get<string>('LOG_CHANNEL_ID');
    private static channel: TextChannel;

    public static log(label: string, message: string, comment: string = null): void {
        const embed = new MessageEmbed();
        embed.setTitle('Новая ошибка в боте.');
        embed.setColor('#ff5e5e');
        embed.addField('Описание ошибки', label);
        if (comment) {
            embed.addField('Комментарий разработчика:', comment);
        }
        embed.setDescription(message);
        this._sendMessage(embed).then(() => {
            console.log(label, message);
        });
    }

    private static async _sendMessage(embed: MessageEmbed) {
        if (!this.channel) {
            const guild = await client.guilds.fetch(this.guildId);
            this.channel = (await guild.channels.fetch(this.channelId)) as TextChannel;
        }
        await this.channel.send({
            embeds: [embed],
        });
    }
}
