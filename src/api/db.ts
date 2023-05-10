import { Get, Post, Delete, Router, Middleware } from "@discordx/koa";
import type { Context } from "koa";
import Message, { IMessage } from "../schemas/message.js"
import mongoose from "mongoose";
import { koaBody } from "koa-body";

@Router()
@Middleware(koaBody())
export class MessageController {

    @Get("/messages")
    async getMessages(context: Context): Promise<void> {
      const message = await Message.find().exec();
      if (message) context.body = message;
      else {
          context.throw(404, { error: 'There are no messages in the database'});
      }
    }

    @Get("/messages/:id")
    async getMessage(context: Context): Promise<void> {
        const { id } = context.params;
        const message = await Message.find({ messageId: id }).exec();
        if (message) context.body = message;
        else {
            context.throw(404, { error: 'Message not found' });
        }
    }

    @Delete("/messages/:id")
    async deleteMessage(context: Context): Promise<void> {
        const { id } = context.params;
        const message = await Message.deleteOne({ messageId: id }).exec();
        if (message) context.body = message;
        else {
            context.throw(404, { error: 'Message not found'});
        }
    }

    @Post("/messages")
    async createMessage(context: Context): Promise<void> {
        context.body = JSON.parse(context.request.body);
        const { messageId, authorId, startTime, endTime, title, description } = context.body as IMessage;
        const message = new Message({
            messageId,
            authorId,
            startTime,
            endTime,
            title,
            description,
        });

        await message.save();
        context.body = message;
    };
}
