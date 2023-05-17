import { Schema, Document, model } from "mongoose";

export interface IGuild extends Document {
    guildId: string;
    defaultLocation: string;
    numReactions: number;
}

const guildSchema: Schema = new Schema({
    guildId: { type: String, required: true },
    numReactions: { type: Number, required: true, default: 1 },
    defaultLocation: { type: String, default: "Default Location" },
});

const Guild = model<IGuild>("Guild", guildSchema);

export default Guild;
