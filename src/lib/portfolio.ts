// The checked config, parsed once, and rules more than one component needs.
import config from "../config";
import { parsePortfolio, type Portfolio } from "./schema";

export const portfolio = parsePortfolio(config);

// The Contact section (and the "Get in touch" button pointing at it) needs something to show.
export const hasContact = (p: Portfolio) => Boolean(p.person.email) || p.socials.length > 0;
