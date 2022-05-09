import { Schema, model } from 'mongoose';

export interface IUser {
    id: string;
    balance: number;
    level: number;
    experience: number;
    online: number;
    reputation: number;
    married: string;
    background: string;
    last_work: number;
}

const schema = new Schema<IUser>({
    id: { type: String, required: true },
    balance: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    online: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    married: { type: String, default: '' },
    background: { type: String, default: '' },
    last_work: { type: Number, default: 0 },
});

export const User = model<IUser>('User', schema);
