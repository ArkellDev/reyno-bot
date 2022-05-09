import bankDeposite from './bankDeposite';
import voiceOnline from './voiceOnline';

export const startCrons = async () => {
    try {
        await voiceOnline();
        await bankDeposite();
        console.log(`Crons started!`);
    } catch (e) {
        console.log(`Ошибка при инициализации крон задача: `, e);
    }
};
