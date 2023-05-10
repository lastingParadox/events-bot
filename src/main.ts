import { dirname, importx } from "@discordx/importer";
import { Koa } from "@discordx/koa";
import type { Interaction, Message } from "discord.js";
import { IntentsBitField, Partials } from "discord.js";
import { Client } from "discordx";
import dotenv from 'dotenv';
import mongoose from "mongoose";

dotenv.config();

export const bot = new Client({
  // To use only guild command
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildScheduledEvents,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: "!",
  },
});

bot.once("ready", async () => {
  // Make sure all guilds are cached
  // await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log("Bot started");
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

bot.on("messageCreate", (message: Message) => {
  bot.executeCommand(message);
});

bot.on("messageReactionAdd", (reaction, user) => {
  bot.executeReaction(reaction, user);
})

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands,api}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(
    `${dirname(import.meta.url)}/{events,commands,api}/**/*.{ts,js}`
  );

  // Let's start the bot
  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }
  else if (!process.env.MONGO_URI) {
    throw Error("Could not find MONGO_URI in your environment");
  }

  // Log in with your bot token
  await bot.login(process.env.BOT_TOKEN);

  // ************* rest api section: start **********

  mongoose.connect(process.env.MONGO_URI);

  // api: prepare server
  const server = new Koa();

  // api: need to build the api server first
  await server.build();

  // api: let's start the server now
  const port = process.env.PORT ?? 3000;
  server.listen(port, () => {
    console.log(`discord api server started on ${port}`);
    console.log(`visit localhost:${port}/guilds`);
  });

  // ************* rest api section: end **********
}

run();
