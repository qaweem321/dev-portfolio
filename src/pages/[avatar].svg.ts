// Built into dist/avatar.svg only when the config uses an illustrated avatar (a photo needs no file).
import type { APIRoute, GetStaticPaths } from "astro";
import { avatarSvg } from "../lib/avatar";
import { portfolio } from "../lib/portfolio";

export const getStaticPaths = (() => {
  const { avatar } = portfolio.person;
  return "seed" in avatar ? [{ params: { avatar: "avatar" }, props: { seed: avatar.seed } }] : [];
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ seed: string }> = ({ props }) =>
  new Response(avatarSvg(props.seed), { headers: { "Content-Type": "image/svg+xml" } });
