import {
    ChannelType,
    GuildScheduledEventEntityType,
    MessageReaction,
    User,
} from "discord.js";
import { Discord, Reaction } from "discordx";
import dayjs from "dayjs";
import getOrCreateGuild from "../bin/getCreateGuild.js";
import { bot } from "../main.js";

@Discord()
export class EventReact {
    @Reaction({ aliases: ["white_check_mark"], emoji: "✅" })
    async eventInterested(
        reaction: MessageReaction,
        user: User
    ): Promise<void> {
        if (user.bot) return;

        const guild = getOrCreateGuild(reaction.message.guild?.id);

        let response = await fetch(
            `http://localhost:3000/messages/${reaction.message.id}`
        );
        let json = await response.json();
        let event = json[0];

        if (typeof event === "undefined") return;

        if (user.id === event.authorId) {
            await user.send(
                `You cannot react to your own event submission!\nEvent: ${event.title}`
            );
            await reaction.message.reactions
                .resolve("✅")
                ?.users.remove(user.id);
            return;
        }

        let numReactions = reaction.message.reactions.resolve("✅")?.count || 2;
        // Accounting for the bot reaction...
        numReactions = numReactions - 1;

        const guildReactionCount =
            (await guild.then((guild) => guild?.numReactions)) || 1;

        if (numReactions < guildReactionCount) return;

        const discordEvent =
            await reaction.message.guild?.scheduledEvents.create({
                name: event.title,
                scheduledStartTime: dayjs(event.startTime).toDate(),
                scheduledEndTime: dayjs(event.endTime).toDate(),
                entityType: GuildScheduledEventEntityType.External,
                description: event.description,
                privacyLevel: 2,
                entityMetadata: { location: "Default Location" },
            });

        let link;
        let inviteChannel;
        const channelType = reaction.message.channel.type;
        if (
            channelType === ChannelType.PublicThread ||
            channelType === ChannelType.PrivateThread
        )
            inviteChannel = reaction.message.channel.parent?.id;
        else inviteChannel = reaction.message.channel.id;

        link = await discordEvent?.createInviteURL({
            channel: inviteChannel,
            maxAge: 0,
        });

        const userArray: string[] = [`<@${event.authorId}>`];
        reaction.message.reactions.resolve("✅")?.users.cache.each((user) => {
            if (!user.bot && userArray.length < 10)
                userArray.push(`<@${user.id}>`);
        });

        await reaction.message.channel.send(
            `Successfully created event ${event.title}!\n${userArray.join(
                " "
            )}\n${link as string}`
        );

        await reaction.message.delete();

        response = await fetch(
            `http://localhost:3000/messages/${reaction.message.id}`,
            { method: "DELETE" }
        );

        event = await response.json();

        console.log(
            `Removed event suggestion ${event.title} in guild ${
                reaction.message.guild?.id || ""
            }`
        );
    }

    @Reaction({ aliases: ["x"], emoji: "❌" })
    async eventDelete(reaction: MessageReaction, user: User): Promise<void> {
        if (user.id === bot.user?.id) return;

        let response = await fetch(
            `http://localhost:3000/messages/${reaction.message.id}`
        );
        let json = await response.json();
        let event = json[0];

        if (typeof event === "undefined") return;

        if (
            user.id !== event.authorId &&
            user.id !== reaction.message.guild?.ownerId
        ) {
            await reaction.message.reactions
                .resolve("❌")
                ?.users.remove(user.id);
            return;
        }

        await reaction.message.delete();

        response = await fetch(
            `http://localhost:3000/messages/${reaction.message.id}`,
            {
                method: "DELETE",
            }
        );
        event = await response.json();
        console.log(event);

        console.log(
            `Deleted event ${event.title} in guild ${
                reaction.message.guild?.id || ""
            }`
        );
    }
}
