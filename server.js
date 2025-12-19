require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Server TemuCepat Jalan!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`=================================`);
});