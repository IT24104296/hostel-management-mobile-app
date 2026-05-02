const addOneMonth = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const originalDay = d.getDate();

  d.setMonth(d.getMonth() + 1);

  // Edge case: 31 Jan → 28/29 Feb, 31 Mar → 30 Apr, etc.
  if (d.getDate() !== originalDay) {
    d.setDate(0); // last day of the previous month (i.e. correct next month)
  }
  return d;
};

const getBillingPeriod = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

module.exports = {
  addOneMonth,
  getBillingPeriod,
};