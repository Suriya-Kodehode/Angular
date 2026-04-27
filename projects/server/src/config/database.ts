import mongoose, { type ConnectOptions } from 'mongoose';

interface DatabaseConfig {
  primaryUri: string;
  fallbackUri?: string;
  connectOptions: ConnectOptions;
}

function isDnsNotFound(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo'))
  );
}

export async function connectDatabase(): Promise<void> {
  const uri = process.env['MONGODB_URI'];
  if (!uri) throw new Error('MONGODB_URI is not defined');

  mongoose.connection.on('connected', () => console.log('MongoDB connected'));
  mongoose.connection.on('error', (err: Error) => console.error('MongoDB error:', err));
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

  const dbConfig: DatabaseConfig = {
    primaryUri: uri.trim(),
    fallbackUri: uri.trim().includes('@mongo:')
      ? uri.trim().replace('@mongo:', '@localhost:')
      : undefined,
    connectOptions: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  };

  try {
    await mongoose.connect(dbConfig.primaryUri, dbConfig.connectOptions);
  } catch (error: unknown) {
    if (!dbConfig.fallbackUri || !isDnsNotFound(error)) {
      throw error;
    }

    console.warn('Mongo host was not resolvable. Retrying with localhost...');

    await mongoose.connect(dbConfig.fallbackUri, dbConfig.connectOptions);
  }
}
