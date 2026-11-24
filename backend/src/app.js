import express from 'express';
import cors from 'cors';
import { rutas } from './routes/index.js';
import { rutaNoEncontrada, manejoErrores } from './middlewares/manejoErrores.js';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/api', rutas);
app.use(rutaNoEncontrada);
app.use(manejoErrores);
