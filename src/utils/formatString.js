export function formatCategory(input) {
  const match = input.match(/^([A-Z]+\d+)\s+-\s+\[(.*?)\]\s+-\s+(.*)$/i);
  if (!match) return input;

  const [_, prefix, method, location] = match;

  const methodMap = {
    'Fully washed': 'FW',
    'Natural': 'NT',
    'Hanny': 'HN',
  };

  const methodShort = methodMap[method.trim()] || method.toUpperCase().slice(0, 2);

  return `${prefix}-${methodShort}-${location}`;
}
