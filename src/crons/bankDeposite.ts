import { CronJob } from 'cron';
import { BankCard, IBankCard } from '../models/BankCard';
import moment from 'moment';

const cron = async () => {
    try {
        BankCard.find({}).then((cards: IBankCard[]) => {
            cards.forEach(async (card: any) => {
                if (card.last_bonus > moment().unix() - 604800) return;
                if (card.balance <= 0) {
                    await BankCard.findOneAndUpdate({ id: card.id }, { last_bonus: moment().unix() });
                }

                await BankCard.findOneAndUpdate(
                    { id: card.id },
                    { $inc: { balance: +card.balance / 10 }, last_bonus: moment().unix() },
                );
            });
        });
    } catch (e) {
        console.log(`Произошла ошибка при обработке крон задачи: bankDeposite`, `\`\`\`${e}\`\`\``);
    }
};

export default async (): Promise<void> => {
    new CronJob('* * * * *', cron, null, true, null, null, true);
    console.log(`Bank Deposite up!`);
};
