/* eslint-disable no-irregular-whitespace */
export const calculateSizeSavings = (codeBefore: string, codeAfter: string) => {
  const sizeBefore = (codeBefore.length * 2) / 1024;
  const sizeAfter = (codeAfter.length * 2) / 1024;
  const savingsNumber = sizeBefore - sizeAfter;
  const savingsPercent = (1 - codeAfter.length / codeBefore.length) * 100;

  return {
    before: `${sizeBefore.toFixed(2)} KB`,
    after: `${sizeAfter.toFixed(2)} KB`,
    savings: `${savingsNumber > 0 ? `${savingsNumber.toFixed(2)}` : 0} KB`,
    savingsPercent: `${savingsPercent > 0 ? savingsPercent.toFixed(2) : 0} %`,
  };
};
