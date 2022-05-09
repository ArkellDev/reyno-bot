import Canvas, { registerFont } from 'canvas';
import path from 'path';
import { GuildMember } from 'discord.js';
import { IUser, User } from '../models/User';
import moment from 'moment';

export default async (member: GuildMember, user: IUser, percent: number): Promise<Buffer> => {
    const canvas = Canvas.createCanvas(1280, 720);
    const context = canvas.getContext('2d');
    const background = await Canvas.loadImage(path.resolve(__dirname, '../../assets/Profile.png'));

    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    registerFont(path.resolve(__dirname, '../../assets/Nexa Light.otf'), {
        family: 'Nexa',
        style: 'normal',
        weight: '200',
    });

    registerFont(path.resolve(__dirname, '../../assets/Nunito-ExtraLight.ttf'), {
        family: 'Nunito',
        style: 'normal',
        weight: '200',
    });

    registerFont(path.resolve(__dirname, '../../assets/Myriad.otf'), {
        family: 'Myriad',
        style: 'normal',
        weight: '200',
    });

    // background

    if (user.background !== '') {
        try {
            const background: Canvas.Image = await Canvas.loadImage(user.background);
            context.globalAlpha = 0.2;
            context.drawImage(background, 0, 0, canvas.width, canvas.height);
            context.globalAlpha = 1;
        } catch {
            await User.findOneAndUpdate({ id: user.id }, { background: '' });
        }
    }

    // nickname

    context.font = 'regular 62px Nexa';
    context.fillStyle = '#e0e0e0';

    context.fillText(member.user.tag, 318, 128);

    // // main

    context.font = 'regular 55px Myriad';

    context.fillText('Баланс:', 113, 420);
    context.fillText('Онлайн:', 529, 420);
    context.fillText('Репутация:', 932, 420);

    // balance

    context.font = 'regular 45px Nunito-ExtraLight';

    context.fillText(`${user.balance.toFixed(0)}`, 117, 482);

    // online

    const duration = moment.duration(user.online * 1000);
    const hours = `${duration.hours()}`;
    const minutes = `${duration.minutes()}`;

    const hoursInSeconds = duration.hours() * 3600;
    const minutesInSeconds = duration.minutes() * 60;

    const days = `${(user.online - hoursInSeconds - minutesInSeconds) / 86400}`;

    context.fillText(`${days}д. ${hours}ч. ${minutes}м.`, 535, 482);

    // reputation

    context.fillText(`${user.reputation.toFixed(0)}`, 935, 482);

    // marriage

    if (user.married !== '') {
        const marriedMember: GuildMember = member.guild.members.cache.get(user.married);

        context.font = 'regular 41px Nexa';
        context.fillText(marriedMember.user.tag, 125, 674);

        const heartIcon = await Canvas.loadImage(path.resolve(__dirname, '../../assets/Heart.png'));
        context.drawImage(heartIcon, 40, 635, 67, 52);
    }

    // lvl progress bar

    context.fillStyle = '#a7b9e7';

    const width = Math.floor((percent / 100) * 700);

    // lvl progress bar
    context.fillRect(397, 162, width, 20);

    context.beginPath();
    context.arc(397, 172, 10, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();

    context.beginPath();
    context.arc(width + 397, 172, 10, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();

    // lvl text
    context.font = 'regular 32px Myriad';

    // calc second position
    const textCalc = context.measureText(`${user.level}`);

    context.fillText(`${user.level}`, 372 - textCalc.width, 184);
    context.fillText(`${user.level + 1}`, 1182, 184);

    // avatar

    context.beginPath();
    context.arc(165, 164, 136, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();

    const avatar = await Canvas.loadImage(member.displayAvatarURL({ format: 'png' }));

    context.drawImage(avatar, 20, 20, 310, 310);

    return canvas.toBuffer();
};
