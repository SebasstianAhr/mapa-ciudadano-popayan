import 'dotenv/config';

const requeridas = ['MONGODB_URI', 'JWT_SECRET'];

for (const nombre of requeridas) {
  if (!process.env[nombre]) {
    throw new Error(`Falta la variable de entorno ${nombre} en el archivo .env`);
  }
}

export const env = {
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: Number(process.env.PORT) || 4000,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
};
