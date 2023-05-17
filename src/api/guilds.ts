import { Get, Post, Delete, Router, Middleware, Patch } from "@discordx/koa";
import type { Context } from "koa";
import Guild, { IGuild } from "../schemas/guild.js";
import { koaBody } from "koa-body";

@Router()
@Middleware(koaBody())
export class GuildController {
    @Get("/guilds")
    async getGuilds(context: Context): Promise<void> {
        const guilds = await Guild.find().exec();
        if (guilds) context.body = guilds;
        else {
            context.throw(404, {
                error: "There are no guilds in the database",
            });
        }
    }

    @Get("/guilds/:id")
    async getGuild(context: Context): Promise<void> {
        const { id } = context.params;
        const guild = await Guild.find({ guildId: id }).exec();
        if (guild) context.body = guild;
        else {
            context.throw(404, { error: "Guild not found" });
        }
    }

    @Delete("/guilds/:id")
    async deleteGuild(context: Context): Promise<void> {
        const { id } = context.params;
        const guild = await Guild.deleteOne({ guildId: id }).exec();
        if (guild) context.body = guild;
        else {
            context.throw(404, { error: "Guild not found" });
        }
    }

    @Post("/guilds")
    async createGuild(context: Context): Promise<void> {
        context.body = JSON.parse(context.request.body);
        let { guildId, numReactions, defaultLocation } = context.body as IGuild;

        if (!numReactions) numReactions = 1;
        if (!defaultLocation) defaultLocation = "Default Location";

        const guild = new Guild({
            guildId,
            numReactions,
            defaultLocation,
        });

        await guild.save();
        context.body = guild;
    }

    @Patch("/guilds/:id")
    async updateGuild(context: Context): Promise<void> {
        const { id } = context.params;
        context.body = JSON.parse(context.request.body);
        let { guildId, numReactions, defaultLocation } = context.body as IGuild;

        const updateObj = {
            guildId,
            numReactions,
            defaultLocation,
        };

        let key: keyof typeof updateObj;
        for (key in updateObj) {
            if (updateObj[key] == null) {
                delete updateObj[key];
            }
        }

        const guild = await Guild.findOneAndUpdate(
            { guildId: id },
            updateObj
        ).exec();
        if (guild) context.body = guild;
        else {
            context.throw(404, { error: "Guild not found" });
        }
    }
}
