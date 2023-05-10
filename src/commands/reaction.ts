import {
    GuildScheduledEventEntityType,
    MessageReaction,
    User,
} from "discord.js";
import { Discord, Reaction } from "discordx";
import dayjs from "dayjs";

@Discord()
export class MessageReact {
    @Reaction({ aliases: ["white_check_mark"], emoji: "✅" })
    async reactRespond(reaction: MessageReaction, user: User): Promise<void> {
        if (user.bot) return;

        let response = await fetch(
            `http://localhost:3000/messages/${reaction.message.id}`
        );
        let json = await response.json();
        const event = json[0];

        if (json.length > 0) {
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
            const link = await discordEvent?.createInviteURL({
                channel: reaction.message.channel.id,
                maxAge: 0,
            });
            await reaction.message.channel.send(
                `Successfully created event ${event.title}!\n${link as string}`
            );
            await reaction.message.delete();

            response = await fetch(
                `http://localhost:3000/messages/${reaction.message.id}`,
                {
                    method: "DELETE",
                }
            );

            json = await response.json();
            console.log(json);
        } else return;
    }
}
