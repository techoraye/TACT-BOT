// src/commands/fun/functions/together/getTogetherInvite.js

const discordTogether = [
    "askaway",
    "awkword",
    "betrayal",
    "bobble",
    "checkers",
    "chess",
    "chessdev",
    "doodlecrew",
    "fishing",
    "land",
    "lettertile",
    "meme",
    "ocho",
    "poker",
    "puttparty",
    "puttpartyqa",
    "sketchheads",
    "sketchyartist",
    "spellcast",
    "wordsnack",
    "youtube",
    "youtubedev",
  ];
  
  module.exports = async (member, choice) => {
    choice = choice.toLowerCase();
  
    const vc = member.voice.channel?.id;
    if (!vc) return "You must be in a voice channel to use this command.";
  
    if (!discordTogether.includes(choice)) {
      return `Invalid game.\nValid games: ${discordTogether.join(", ")}`;
    }
  
    try {
      const invite = await member.client.discordTogether.createTogetherCode(vc, choice);
      return `${invite.code}`;
    } catch (error) {
      console.error(error);
      return "There was an error generating the invite.";
    }
  };
  