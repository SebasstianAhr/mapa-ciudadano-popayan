import mongoose from 'mongoose';
import { env } from './env.js';

export async function conectarDB() {
  await mongoose.connect(env.mongodbUri);
  console.log(`MongoDB conectado a la base "${mongoose.connection.name}"`);
}
