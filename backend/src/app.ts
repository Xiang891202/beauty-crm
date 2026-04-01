import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import  publicRoutrs  from './routes/public.routes';
import serviceLogRoutes from './routes/service_log.routes';
import adjustmentRoutes from './routes/adjustment.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 掛載所有路由
app.use('/api', routes);
app.use('/api', publicRoutrs);
app.use('/api/', serviceLogRoutes);
app.use('/api/', adjustmentRoutes);
// 全域錯誤處理
app.use(errorHandler);

export default app;