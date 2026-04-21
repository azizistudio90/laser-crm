export default {
  // Other configurations...
  server: {
    contentBase: true,
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval'" 
    }
  }
};