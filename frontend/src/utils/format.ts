// frontend/src/utils/format.ts
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW');
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('zh-TW');
};

export const formatCurrency = (amount: number): string => {
  return `NT$ ${amount.toLocaleString()}`;
};