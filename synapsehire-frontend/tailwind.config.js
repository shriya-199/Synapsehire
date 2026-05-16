export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        panel: '#f7f8fb',
        brand: '#1f7a8c',
        accent: '#bf5f45'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(23, 32, 51, 0.12)'
      }
    }
  },
  plugins: []
};
