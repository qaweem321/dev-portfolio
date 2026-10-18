import { expect, test } from "vitest";
import { asset } from "../src/lib/paths";

test("files in public/ get the base path; full addresses pass through", () => {
  expect(asset("/me.jpg")).toBe("/me.jpg");
  expect(asset("me.jpg")).toBe("/me.jpg");
  for (const address of ["https://alex.dev/me.jpg", "http://alex.dev/me.jpg", "//cdn.alex.dev/me.jpg", "data:image/png;base64,AAAA"]) {
    expect(asset(address)).toBe(address);
  }
});
