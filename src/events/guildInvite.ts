import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

import getOrCreateGuild from "../bin/getCreateGuild.js";

@Discord()
export class guildInvite {
    @On()
    async guildCreate(
        [guild]: ArgsOf<"guildCreate">,
        client: Client
    ): Promise<void> {
        getOrCreateGuild(guild.id);
    }
}
