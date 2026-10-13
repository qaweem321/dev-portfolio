import { expect, test } from "vitest";
import { formatMonth, formatPeriod, tagsByUse } from "../src/lib/format";

test("months read the same everywhere", () => {
  expect(formatMonth("2023-03")).toBe("Mar 2023");
  expect(formatMonth("2026-12")).toBe("Dec 2026");
  expect(formatMonth("2020-01")).toBe("Jan 2020");
});

test("a period without an end is current", () => {
  expect(formatPeriod("2023-03")).toBe("Mar 2023 – Present");
  expect(formatPeriod("2020-06", "2023-02")).toBe("Jun 2020 – Feb 2023");
});

test("filter tags are ordered by how many projects use them", () => {
  const projects = [{ tags: ["React", "Go"] }, { tags: ["React", "CSS"] }, { tags: ["CSS"] }, { tags: [] }];
  expect(tagsByUse(projects)).toEqual(["CSS", "React", "Go"]);
});
