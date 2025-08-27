export const calculateTotals = (data) => {
  console.log("Calculating totals with data:", data);
  let initial = {
    totalTransported: 0,
    totalDelivered: 0,
    totalVariation: 0,
    averageFiftenDelivered: 0,
    averagethirteenFourteenDelivered: 0,
    averageLowgradeDelivered: 0,
  };
  let itemscount = 0;
  if (!data || data.length === 0) return initial;
  data.reduce((acc, item) => {
    acc.totalTransported += item.transportedKgs || 0;
    acc.totalDelivered += item.deliveredKgs || 0;
    acc.totalVariation += item.variation || 0;
    acc.averageFiftenDelivered += item["CWS-PCA16+"] || 0;
    acc.averagethirteenFourteenDelivered += item["CWS-PCA13/14"] || 0;
    acc.averageLowgradeDelivered += item["CWS-PCALG"] || 0;
    itemscount += 1;
    return acc;
  }, initial);
  initial.averageFiftenDelivered =
    itemscount > 0 ? initial.averageFiftenDelivered / itemscount : 0;
  initial.averagethirteenFourteenDelivered =
    itemscount > 0 ? initial.averagethirteenFourteenDelivered / itemscount : 0;
  initial.averageLowgradeDelivered =
    itemscount > 0 ? initial.averageLowgradeDelivered / itemscount : 0;
  return initial;
};
