import { Schema, model } from 'mongoose';

export interface IBankCard {
    id: string;
    balance: number;
    cardNumber: string;
    expirationDate: string;
    cvv: number;
    style: string;
    last_bonus: number;
}

const schema = new Schema<IBankCard>({
    id: { type: String, required: true },
    balance: { type: Number, default: 0 },
    cardNumber: { type: String, required: true },
    expirationDate: { type: String, required: true },
    cvv: { type: Number, required: true },
    style: { type: String, default: 'Default.png' },
    last_bonus: { type: Number, default: 0 },
});

export const BankCard = model<IBankCard>('BankCard', schema);
