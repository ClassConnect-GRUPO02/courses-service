import dotenv from 'dotenv';
import app from './app';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.listen(Number(PORT), HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
