import Canvas, { registerFont } from 'canvas';
import path from 'path';
import { GuildMember } from 'discord.js';

export default async (memberOne: GuildMember, memberTwo: GuildMember): Promise<Buffer> => {
    const canvas = Canvas.createCanvas(400, 130);
    const context = canvas.getContext('2d');
    const background = await Canvas.loadImage(path.resolve(__dirname, '../../assets/love.png'));

    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    context.beginPath();
    context.arc(90, 68, 45, 0, Math.PI * 2, true);
    context.closePath();
    // context.clip();

    // context.restore();
    // context.save();
    // context.beginPath();
    context.arc(312, 68, 45, 0, Math.PI * 2, true);
    context.closePath();

    context.clip();

    const avatarOne = await Canvas.loadImage(memberOne.displayAvatarURL({ format: 'png' }));

    context.drawImage(avatarOne, 46, 24, 89, 89);

    const avatarTwo = await Canvas.loadImage(memberTwo.displayAvatarURL({ format: 'png' }));

    context.drawImage(avatarTwo, 267, 24, 89, 89);

    return canvas.toBuffer();
};
