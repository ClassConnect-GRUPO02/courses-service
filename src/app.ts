import express from 'express';
import cors from 'cors';
import router from './router/router';
import { errorHandler } from './errorHandler/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use(errorHandler);

export default app;