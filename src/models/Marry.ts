import { Schema, model, Model } from 'mongoose';
import findOneOrCreate from 'mongoose-findoneorcreate';

export interface IMarry {
    _id: Schema.Types.ObjectId;
    channel: string;
    users: string[];
    balance: number;
    online: number;
    last_payment: number;
    active: boolean;
}

interface ModelMethods extends Model<IMarry> {
    findOneOrCreate(find, create): Promise<IMarry>;
}

const schema = new Schema<IMarry, ModelMethods>({
    channel: { type: String, default: `Не создана` },
    users: { type: [String] },
    balance: { type: Number, default: 0 },
    online: { type: Number, default: 0 },
    last_payment: { type: Number },
    active: { type: Boolean, default: false },
});

schema.plugin(findOneOrCreate);

export const Marry = model<IMarry, ModelMethods>('Marry', schema);
