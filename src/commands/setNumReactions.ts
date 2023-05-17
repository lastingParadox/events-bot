import { CommandInteraction, ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class EventCommand {
    @Slash({
        description:
            "Sets the reaction count for suggested events to become events.",
        name: "set-reaction-count",
    })
    async setNumReactions(
        @SlashOption({
            description: "Value to set the guild's reaction count to",
            name: "reaction-count",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        reactCount: number,
        interaction: CommandInteraction
    ): Promise<void> {
        let response = await fetch(
            `http://localhost:3000/guilds/${interaction.guild?.id}`
        );
        let json = await response.json();
        let guildResponse = json[0];

        if (typeof guildResponse === "undefined") {
            response = await fetch("http://localhost:3000/guilds", {
                method: "POST",
                body: JSON.stringify({
                    guildId: interaction.guild?.id,
                    numReactions: reactCount,
                }),
            });
            let json = await response.json();
            const guildResponse = json[0];
            console.log(guildResponse);

            await interaction.reply(
                `Successfully set the reaction count to \`${reactCount}\` for ${
                    interaction.guild?.name || "the guild"
                }.`
            );
            return;
        }

        response = await fetch(
            `http://localhost:3000/guilds/${interaction.guild?.id}`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    numReactions: reactCount,
                }),
            }
        );
        json = await response.json();
        console.log(json);

        await interaction.reply(
            `Successfully set the reaction count to \`${reactCount}\` for ${
                interaction.guild?.name || "the guild"
            }.`
        );
    }
}
