export function formatDateTime(isoString: string) {
  const locale = navigator.language || "de-DE";
  const date = new Date(isoString);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const datePart = dateFormatter.format(date);
  const timePart = timeFormatter.format(date);

  return `${datePart} ${timePart}`;
}
