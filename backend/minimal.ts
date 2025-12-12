console.log('1. Starting minimal test');

try {
  console.log('2. Importing express');
  import('express').then(exp => {
    console.log('3. Creating express app');
    const app = exp.default();
    console.log('4. App created successfully');
    console.log('Server would listen here');
    process.exit(0);
  }).catch(e => {
    console.error('Failed to import express:', e);
    process.exit(1);
  });
} catch (e) {
  console.error('Outer error:', e);
  process.exit(1);
}
