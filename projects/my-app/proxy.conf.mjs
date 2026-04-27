const target = process.env['API_BASE_URL'] ?? 'http://localhost:3000';

export default {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  },
};
