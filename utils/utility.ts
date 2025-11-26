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

export const getMonthYearString = (selectedDate: Date) => {
  return `${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
};

export const getMonthYearStringFromNumbers = (month: number, year: number) => {
  return `${months[month - 1]} ${year}`;
};

// Helper function to get available months
export const getAvailableMonthsData = () => {
  const today = new Date();
  const months = [];

  // Add current month and next 2 months (total 3 months)
  for (let i = 0; i < 3; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push(date);
  }

  return months;
};

export const getInitials = (name?: string) => {
  if (!name) return "U";
  const names = name.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
