// Ways to write to an address. A web page can't tell whether a visitor has an email app (a
// mailto: link with none just does nothing), so the Email button offers a choice instead of
// guessing: the email app, the big webmail services with the address filled in, or a copy.

export type MailOption = { label: string; href: string; webmail: boolean };

export function mailOptions(email: string): MailOption[] {
  const to = encodeURIComponent(email);
  return [
    { label: "Email app", href: `mailto:${email}`, webmail: false },
    { label: "Gmail", href: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}`, webmail: true },
    { label: "Outlook", href: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}`, webmail: true },
    { label: "Yahoo Mail", href: `https://compose.mail.yahoo.com/?to=${to}`, webmail: true },
  ];
}
