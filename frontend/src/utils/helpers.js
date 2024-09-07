export const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  // Convert 24-hour time to 12-hour time
  const hours12 = hours % 12 || 12; // `|| 12` converts "0" to "12" for midnight
  const ampm = hours >= 12 ? "pm" : "am";

  return `${day}/${month} ${hours12}:${minutes}${ampm}`;
};
