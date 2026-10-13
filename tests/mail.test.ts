import { expect, test } from "vitest";
import { mailOptions } from "../src/lib/mail";

test("every option writes to the address, webmail ones with it filled in", () => {
  const options = mailOptions("alex.morgan@example.com");
  expect(options.map((o) => o.label)).toEqual(["Email app", "Gmail", "Outlook", "Yahoo Mail"]);
  expect(options[0]).toEqual({ label: "Email app", href: "mailto:alex.morgan@example.com", webmail: false });
  for (const option of options.slice(1)) {
    expect(option.webmail).toBe(true);
    expect(new URL(option.href).protocol).toBe("https:");
    expect(new URL(option.href).searchParams.get("to"), option.label).toBe("alex.morgan@example.com");
  }
});

test("addresses with unusual characters stay in one piece", () => {
  const gmail = mailOptions("first+jobs&more@example.com")[1];
  expect(new URL(gmail.href).searchParams.get("to")).toBe("first+jobs&more@example.com");
  expect(new URL(gmail.href).searchParams.get("view")).toBe("cm");
});
