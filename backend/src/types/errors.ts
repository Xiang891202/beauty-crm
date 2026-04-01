// types/errors.ts
export class InsufficientQuotaError extends Error {
  constructor() {
    super('服務剩餘次數不足');
    this.name = 'InsufficientQuotaError';
  }
}

// backend/src/types/error.ts
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}