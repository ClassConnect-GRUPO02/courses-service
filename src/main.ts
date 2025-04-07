import express from 'express';
import router from './router/router';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(router);

app.listen(Number(PORT),HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});

export default app;
