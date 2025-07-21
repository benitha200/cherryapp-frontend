export function formatDate(inputDate) {
  if (!inputDate) {
    return "-";
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  try {
    const date = new Date(inputDate);
    
    if (isNaN(date.getTime())) {
      return "-";
    }
    
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();

    return `${year} ${month} ${day}`;
  } catch (error) {
    return "-";
  }
}