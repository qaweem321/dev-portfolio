// Built into dist/avatar.svg only when the config uses an illustrated avatar (a photo needs no file).
import type { APIRoute, GetStaticPaths } from "astro";
import config from "../config";
import { avatarSvg } from "../lib/avatar";
import { parsePortfolio } from "../lib/schema";

export const getStaticPaths = (() => {
  const { avatar } = parsePortfolio(config).person;
  return "seed" in avatar ? [{ params: { avatar: "avatar" }, props: { seed: avatar.seed } }] : [];
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ seed: string }> = ({ props }) =>
  new Response(avatarSvg(props.seed), { headers: { "Content-Type": "image/svg+xml" } });
