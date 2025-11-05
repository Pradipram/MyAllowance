export const getMonthYearString = (selectedDate: Date) => {
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
  return `${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
};

// Helper function to get available months
export const getAvailableMonthsData = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const months = [];

  // Add current month and next 2 months (total 3 months)
  for (let i = 0; i < 3; i++) {
    const date = new Date(currentYear, currentMonth - 1 + i, 1);
    const monthNum = date.getMonth() + 1;
    const yearNum = date.getFullYear();
    const monthName = date.toLocaleString("default", { month: "long" });

    months.push({
      value: `${monthNum}-${yearNum}`,
      label: `${monthName} ${yearNum}`,
      month: monthNum,
      year: yearNum,
    });
  }

  return months;
};
