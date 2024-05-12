import { generateUsername } from "friendly-username-generator";
import { User } from "../values";

export const generateRandomUser = (): User => {
  const id = generateUsername();
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  return {
    id,
    balance: { currency: "TMP", value: 1000 },
    emoji,
  };
};

const emojis = [
  "👶",
  "🧒",
  "👦",
  "👧",
  "🧑",
  "👱",
  "👨",
  "🧔",
  "🧔‍♂️",
  "🧔‍♀️",
  "👨‍🦰",
  "👨‍🦱",
  "👨‍🦳",
  "👨‍🦲",
  "👩",
  "👩‍🦰",
  "🧑‍🦰",
  "👩‍🦱",
  "🧑‍🦱",
  "👩‍🦳",
  "🧑‍🦳",
  "👩‍🦲",
  "🧑‍🦲",
  "👱‍♀️",
  "👱‍♂️",
  "🧓",
  "👴",
  "👵",
];
