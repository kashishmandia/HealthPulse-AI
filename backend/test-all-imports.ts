console.log('Testing imports from index.ts');

async function testImports() {
  try {
    console.log('1. Importing express');
    const exp = await import('express');
    console.log('✓ express');

    console.log('2. Importing cors');
    const cors = await import('cors');
    console.log('✓ cors');

    console.log('3. Importing helmet');
    const helmet = await import('helmet');
    console.log('✓ helmet');

    console.log('4. Importing compression');
    const compression = await import('compression');
    console.log('✓ compression');

    console.log('5. Importing express-rate-limit');
    const rateLimit = await import('express-rate-limit');
    console.log('✓ express-rate-limit');

    console.log('6. Importing socket.io');
    const socketio = await import('socket.io');
    console.log('✓ socket.io');

    console.log('7. Importing config');
    const config = await import('./src/config.js');
    console.log('✓ config');

    console.log('8. Importing db/index');
    const db = await import('./src/db/index.js');
    console.log('✓ db/index');

    console.log('9. Importing services/websocket');
    const websocket = await import('./src/services/websocket.js');
    console.log('✓ services/websocket');

    console.log('10. Importing middleware');
    const middleware = await import('./src/middleware.js');
    console.log('✓ middleware');

    console.log('11. Importing routes/auth');
    const authRoutes = await import('./src/routes/auth.js');
    console.log('✓ routes/auth');

    console.log('12. Importing routes/health');
    const healthRoutes = await import('./src/routes/health.js');
    console.log('✓ routes/health');

    console.log('13. Importing routes/provider');
    const providerRoutes = await import('./src/routes/provider.js');
    console.log('✓ routes/provider');

    console.log('\nAll imports successful!');
  } catch (e) {
    console.error('\nError:', e);
    process.exit(1);
  }
}

testImports().then(() => process.exit(0));
