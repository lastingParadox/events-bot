import { Schema, Document, model } from "mongoose";

export interface IMessage extends Document {
    messageId: string;
    authorId: string;
    startTime: Date;
    endTime: Date;
    title: string;
    description: string | undefined;
}

const messageSchema: Schema = new Schema({
    messageId: { type: String, required: true, unique: true },
    authorId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    title: { type: String, required: true },
    description: { type: String },
});

const Message = model<IMessage>("Message", messageSchema);

export default Message;
