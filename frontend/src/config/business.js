export const BUSINESS = {
  name: "Last Planner Julz Funeral Planning Hub",
  shortName: "Last Planner Julz",
  phoneDisplay: "+254 799 847 727",
  phoneLink: "+254799847727",
  email: "lastplannerjulzlimited@gmail.com",
  address: "Kahawa West",
  serviceArea: "Countrywide, Kenya",
  weekdayHours: "Monday–Friday, 8:00 am–6:00 pm",
  saturdayHours: "Saturday, 9:00 am–5:00 pm",
  planningDepositPercent: 10,
};

export const formatKES = (amount) => `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;

export const getLocalDateInputValue = () => {
  const localDate = new Date();
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
};
