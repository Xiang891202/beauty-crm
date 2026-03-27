// types/errors.ts
export class InsufficientQuotaError extends Error {
  constructor() {
    super('服務剩餘次數不足');
    this.name = 'InsufficientQuotaError';
  }
}