import { IGuild } from "../schemas/guild.js";

export default async function getOrCreateGuild(guildId: string | undefined) : Promise<IGuild | undefined> {
    if (guildId == undefined) return undefined;

    let response = await fetch(`http://localhost:3000/guilds/${guildId}`);
    let json = await response.json();
    let guildResponse = json[0];

    if (typeof guildResponse !== "undefined") return guildResponse;

    response = await fetch("http://localhost:3000/guilds", {
        method: "POST",
        body: JSON.stringify({
            guildId: guildId,
        }),
    });

    json = await response.json();
    guildResponse = json[0];

    console.log(`Created new guild ${guildId}`);

    return guildResponse;
}
