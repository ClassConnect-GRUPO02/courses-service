import express from 'express';
import cors from 'cors';
import router from './router/router';
import dotenv from 'dotenv';
import { error } from 'winston';
import { errorHandler } from './errorHandler/errorHandler';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

const app = express();
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(router);
app.use(errorHandler);

app.listen(Number(PORT),HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});

export default app;
