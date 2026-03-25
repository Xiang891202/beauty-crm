import * as customerRepo from '../repositories/customer.repo';

export const getAllCustomers = async () => {
  return await customerRepo.getCustomers();
};

export const getCustomer = async (id: number) => {
  return await customerRepo.getCustomerById(id);
};

export const addCustomer = async (data: any) => {
  // 可在此加入業務邏輯驗證
  return await customerRepo.createCustomer(data);
};

export const modifyCustomer = async (id: number, data: any) => {
  return await customerRepo.updateCustomer(id, data);
};

export const removeCustomer = async (id: number) => {
  return await customerRepo.deleteCustomer(id);
};