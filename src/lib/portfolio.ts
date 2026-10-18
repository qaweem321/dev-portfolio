// The checked config, parsed once, and rules more than one component needs.
import config from "../config";
import { parsePortfolio, type Portfolio } from "./schema";

// Build time only: PORTFOLIO_CONFIG is set when the tests build from their sample config.
export const portfolio = parsePortfolio(config, process.env.PORTFOLIO_CONFIG ?? "src/config.ts");

// The Contact section (and the "Get in touch" button pointing at it) needs something to show.
export const hasContact = (p: Portfolio) => Boolean(p.person.email) || p.socials.length > 0;
