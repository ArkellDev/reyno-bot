import Canvas, { registerFont } from 'canvas';
import path from 'path';
import { IBankCard } from '../models/BankCard';

export default async (card: IBankCard): Promise<Buffer> => {
    const canvas = Canvas.createCanvas(482, 271);
    const context = canvas.getContext('2d');
    const background = await Canvas.loadImage(path.resolve(__dirname, `../../assets/CardStyles/${card.style}`));

    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    registerFont(path.resolve(__dirname, '../../assets/phagspa.ttf'), {
        family: 'Phagspa',
        style: 'normal',
        weight: '200',
    });

    registerFont(path.resolve(__dirname, '../../assets/Myriad.otf'), {
        family: 'Myriad',
        style: 'normal',
        weight: '200',
    });

    context.fillStyle = '#ffffff';
    context.font = 'regular 35px phagspa';

    context.fillText(`${card.cardNumber.replace(/\B(?=(\d{4})+(?!\d))/g, ' ')}`, 82, 157);

    context.font = 'regular 25px phagspa';

    context.fillText(`${card.expirationDate}`, 346.4, 221.9);

    context.font = 'regular 18px Myriad';

    context.fillText(`${card.balance.toFixed(1)}`, 207.6, 73.8);

    return canvas.toBuffer();
};
