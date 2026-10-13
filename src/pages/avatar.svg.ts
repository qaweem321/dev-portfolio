// Built once into dist/avatar.svg when the config uses an illustrated avatar.
import type { APIRoute } from "astro";
import config from "../config";
import { avatarSvg } from "../lib/avatar";
import { parsePortfolio } from "../lib/schema";

export const GET: APIRoute = () => {
  const { avatar } = parsePortfolio(config).person;
  const svg = "seed" in avatar ? avatarSvg(avatar.seed) : "";
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml" } });
};
