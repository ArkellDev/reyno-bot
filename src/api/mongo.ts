import mongoose from 'mongoose';
import config from 'config';

export const connectDatabase = async (): Promise<void> => {
    await mongoose.connect(config.get('MONGO_CONN'));
    console.log(`Mongodb connected!`);
};
