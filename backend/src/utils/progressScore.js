module.exports = function computeProgressScore(uomType, targetValue, actualValue) {
  if (!targetValue || !actualValue) return 0;

  const target = parseFloat(targetValue);
  const actual = parseFloat(actualValue);

  switch (uomType) {
    case "numeric":
    case "percentage":
      return Math.min(actual / target, 1);

    case "timeline":
      return actual <= target ? 1 : 0;

    case "zero_based":
      return actual === 0 ? 1 : 0;

    default:
      return 0;
  }
};
