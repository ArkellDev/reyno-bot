import { connectDatabase } from './api/mongo';
import { run } from './api/discord';
import { startCrons } from './crons';

const startApp = async () => {
    await connectDatabase();
    await run();
    await startCrons();
};

startApp().then(() => console.log(`App started!`));
