import { MongoMemoryServer } from 'mongodb-memory-server';

async function startMongoDB() {
  console.log('🚀 Starting MongoDB Memory Server for development...');

  try {
    // Start MongoDB Memory Server
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    console.log(`📍 MongoDB Memory Server started at: ${uri}`);
    console.log('💡 Update your .env.local MONGODB_URI to use this address if needed');
    console.log('🛑 Press Ctrl+C to stop the server');

    // Keep the server running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping MongoDB Memory Server...');
      await mongod.stop();
      console.log('✅ MongoDB Memory Server stopped');
      process.exit(0);
    });

    // Keep the process alive
    await new Promise(() => {}); // Never resolves

  } catch (error) {
    console.error('❌ Error starting MongoDB:', error);
    process.exit(1);
  }
}

startMongoDB();