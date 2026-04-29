const fs = require('fs');
const path = require('path');

// Create .env file for server
const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/psychology_intervention
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
OPENAI_API_KEY=sk-your-openai-api-key-here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
SESSION_SECRET=your_session_secret_here_123456789`;

const envPath = path.join(__dirname, 'server', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created successfully!');
  console.log('📝 Please edit server/.env with your actual API keys');
} catch (error) {
  console.error('❌ Error creating environment file:', error.message);
}

console.log('\n🚀 Next steps:');
console.log('1. Install dependencies: npm run install-all');
console.log('2. Start MongoDB service');
console.log('3. Get OpenAI API key from https://platform.openai.com/');
console.log('4. Update server/.env with your OpenAI API key');
console.log('5. Run the application: npm run dev');
