import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBattleResult extends Document {
    id1: number;
    id2: number;
    ratio: number;
    winnerId: number | null;
    evolveCount: number;
}

const BattleResultSchema: Schema = new Schema({
    id1: { type: Number, required: true },
    id2: { type: Number, required: true },
    ratio: { type: Number, required: true },
    winnerId: { type: Number, default: null },
    evolveCount: { type: Number, required: true },
});

// Wenn das Modell bereits existiert, wiederverwenden; ansonsten erstellen
const BattleResult: Model<IBattleResult> =
    (mongoose.models.BattleResult as Model<IBattleResult>) ||
    mongoose.model<IBattleResult>('BattleResult', BattleResultSchema);

export default BattleResult;
