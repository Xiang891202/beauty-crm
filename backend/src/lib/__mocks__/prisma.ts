// __tests__/mocks/prisma.ts

function createMock() {
  return {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
  };
}

export const prisma: any = {
  member: createMock(),
  service: createMock(),
  servicePackage: createMock(),
  memberPackage: createMock(),
  package: createMock(),           // 如果有些地方用 package
  serviceLog: createMock(),
  adjustment: createMock(),
  customer: createMock(),          // 相容可能的名稱
  $transaction: jest.fn((cb: any) => cb(prisma)),
};

export default prisma;