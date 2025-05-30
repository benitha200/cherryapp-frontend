export const formatNumberWithCommas = (number) => {
  const new_number = Number(number).toFixed(1);
  return new_number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
