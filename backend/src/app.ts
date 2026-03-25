import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 掛載所有路由
app.use('/api', routes);

// 全域錯誤處理
app.use(errorHandler);

export default app;