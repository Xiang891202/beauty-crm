import { Request, Response } from 'express';
import * as customerService from '../services/customer.service';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    // 輸出完整的錯誤對象
    console.error('Get customers error details:', JSON.stringify(error, null, 2));
    // 也輸出錯誤訊息和堆棧
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomer = async (req: Request, res: Response) => {
  console.log('GET /customers called'); // 新增日誌
  try {
    const id = parseInt(req.params.id as string); // 修正：加上 as string
    const customer = await customerService.getCustomer(id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is empty' });
    }
    const customer = await customerService.addCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    console.log('Updating customer ID:', id, 'Data:', req.body); // 新增
    const customer = await customerService.modifyCustomer(id, req.body);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error); // 確保這行存在
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string); // 修正：加上 as string
    const success = await customerService.removeCustomer(id);
    if (!success) return res.status(404).json({ error: 'Customer not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};