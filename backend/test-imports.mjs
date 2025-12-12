console.log('Testing imports...');

try {
  console.log('1. Importing express');
  import('express').then(() => console.log('✓ express loaded')).catch(e => console.error('✗ express error:', e));
} catch (e) {
  console.error('Error 1:', e);
}

try {
  console.log('2. Importing cors');
  import('cors').then(() => console.log('✓ cors loaded')).catch(e => console.error('✗ cors error:', e));
} catch (e) {
  console.error('Error 2:', e);
}

try {
  console.log('3. Importing compression');
  import('compression').then(() => console.log('✓ compression loaded')).catch(e => console.error('✗ compression error:', e));
} catch (e) {
  console.error('Error 3:', e);
}

try {
  console.log('4. Importing socket.io');
  import('socket.io').then(() => console.log('✓ socket.io loaded')).catch(e => console.error('✗ socket.io error:', e));
} catch (e) {
  console.error('Error 4:', e);
}

try {
  console.log('5. Importing bcryptjs');
  import('bcryptjs').then(() => console.log('✓ bcryptjs loaded')).catch(e => console.error('✗ bcryptjs error:', e));
} catch (e) {
  console.error('Error 5:', e);
}

try {
  console.log('6. Importing dotenv');
  import('dotenv').then(m => { m.config(); console.log('✓ dotenv loaded'); }).catch(e => console.error('✗ dotenv error:', e));
} catch (e) {
  console.error('Error 6:', e);
}

setTimeout(() => {
  console.log('Done testing imports');
  process.exit(0);
}, 2000);
