
export const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
  

export const convertISODate = (isoString: string | undefined | Date) => {
  if (!isoString) return null
  const dateObj = new Date(isoString);

  const date = dateObj.toISOString().split("T")[0]; // Extract date (YYYY-MM-DD)
  const hours = dateObj.getUTCHours(); // Extract hours (UTC)
  const minutes = dateObj.getUTCMinutes(); // Extract minutes (UTC)
  const seconds = dateObj.getUTCSeconds(); // Extract seconds (UTC)

  return `${date}, ${hours}:${minutes}:${seconds}`;
}
