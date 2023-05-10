import {
    ActionRowBuilder,
    CommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    GuildMember,
} from "discord.js";
import { Discord, ModalComponent, Slash } from "discordx";
import dayjs from "dayjs";

@Discord()
export class EventCommand {
    @Slash({ description: "modal", name: "create-event" })
    modal(interaction: CommandInteraction): void {
        const modal = new ModalBuilder()
            .setTitle("Create an Event")
            .setCustomId("createEventModal");

        const eventTitleInputComponent = new TextInputBuilder()
            .setCustomId("eventTitleField")
            .setLabel("Event Title")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Event Title");

        const eventDescriptionInputComponent = new TextInputBuilder()
            .setCustomId("eventDescriptionField")
            .setLabel("Event Description")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1000)
            .setPlaceholder("Alright, so here's how it going to go down...")
            .setRequired(false);

        const eventDateInputComponent = new TextInputBuilder()
            .setCustomId("eventDateField")
            .setLabel("Event Date (Format: MM/DD/YYYY)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(dayjs().add(1, "day").format("MM/DD/YYYY"));

        const eventStartTimeInputComponent = new TextInputBuilder()
            .setCustomId("eventStartField")
            .setLabel("Event Start Time (Format: 12:00 AM)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(
                dayjs().add(1, "day").hour(0).minute(0).format("h:mm A")
            );

        const eventLengthInputComponent = new TextInputBuilder()
            .setCustomId("eventLengthField")
            .setLabel("Event Length in Hours (Format: 1.5)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(String(1.5));

        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
            eventTitleInputComponent
        );
        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
            eventDescriptionInputComponent
        );
        const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(
            eventDateInputComponent
        );
        const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents(
            eventStartTimeInputComponent
        );
        const row5 = new ActionRowBuilder<TextInputBuilder>().addComponents(
            eventLengthInputComponent
        );

        modal.addComponents(row1, row2, row3, row4, row5);

        interaction.showModal(modal);
    }

    @ModalComponent()
    async createEventModal(interaction: ModalSubmitInteraction): Promise<void> {
        const [title, description, date, time, length] = [
            "eventTitleField",
            "eventDescriptionField",
            "eventDateField",
            "eventStartField",
            "eventLengthField",
        ].map((id) => interaction.fields.getTextInputValue(id));

        const startTime = dayjs(`${date} ${time}`);

        if (!startTime.isValid()) {
            await interaction.reply({
                content:
                    "The starting date must be a valid date in the similar to the formatted example `12/10/01` (`M/DD/YY`).\nThe starting time must be a valid time similar to the formatted exmaple `12:01 AM` (`h:mm A`)",
                ephemeral: true,
            });
            return;
        }

        const now = dayjs();

        if (startTime.isBefore(now)) {
            await interaction.reply({
                content:
                    "The start time cannot be before the current date and time.",
                ephemeral: true,
            });
            return;
        }

        const fiveYearsFromNow = now.add(5, "year");

        if (startTime.isAfter(fiveYearsFromNow)) {
            await interaction.reply({
                content:
                    "The start time must be within 5 years of the current date and time.",
                ephemeral: true,
            });
            return;
        }

        const timeLength = parseFloat(length);
        if (isNaN(timeLength)) {
            await interaction.reply({
                content: "The length must be a number.",
                ephemeral: true,
            });
            return;
        }

        let endTime;

        if (timeLength % 1 > 0)
            endTime = startTime
                .add(Math.trunc(timeLength), "hour")
                .add(Math.trunc((timeLength % 1) * 60), "minute");
        else endTime = startTime.add(timeLength, "hour");

        console.log(startTime.format("MM/DD/YYYY"));
        console.log(endTime.format("MM/DD/YYYY"));

        const member = interaction.member as GuildMember;

        const embed = new EmbedBuilder()
            .setColor("#FFA700")
            .setFooter({
                text: `${member.displayName || "User"} suggested an event.`,
                iconURL: member.avatarURL() as string,
            })
            .setTitle(title)
            .addFields({ name: "Description", value: description })
            .addFields({
                name: "Start Date",
                value: `<t:${startTime.unix()}:D>`,
                inline: true,
            })
            .addFields({
                name: "Time Range",
                value: `<t:${startTime.unix()}:t> - <t:${endTime.unix()}:t>`,
                inline: true,
            });

        await interaction.reply({ embeds: [embed] });

        const message = await interaction.fetchReply();
        console.log(message.id);

        const response = await fetch("http://localhost:3000/messages", {
            method: "POST",
            body: JSON.stringify({
                messageId: message.id,
                authorId: member.id,
                title: title,
                description: description,
                startTime: startTime,
                endTime: endTime,
                location: "Default Location",
            }),
        });

        console.log(await response.json());

        message.react("✅");
    }
}
