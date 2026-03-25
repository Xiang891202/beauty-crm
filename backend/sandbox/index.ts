import express from 'express';
import customerRoutes from './customer/routes/customer.routes';

const app = express();
app.use(express.json());

app.use('/customers', customerRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Sandbox server running on port ${PORT}`);
});