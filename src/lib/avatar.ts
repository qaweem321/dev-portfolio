// An illustrated avatar made from any text, so nobody needs a photo. Artwork: "Notionists" by
// Zoish, CC0 1.0 (public domain), rendered by DiceBear. Served as /avatar.svg (see pages/).
import { createAvatar } from "@dicebear/core";
import * as notionists from "@dicebear/notionists";

export function avatarSvg(seed: string) {
  return createAvatar(notionists, { seed, backgroundColor: ["transparent"] }).toString();
}
