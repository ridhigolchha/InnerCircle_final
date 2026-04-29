# 🚀 Quick Start Guide

## Get Everything Running in 5 Minutes!

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Start MongoDB
**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 3: Run the Application
```bash
npm run dev
```

### Step 4: Test the System
1. **Open** http://localhost:3000
2. **Click "Get Started"** to register
3. **Fill out the registration form**
4. **Login** with your credentials
5. **Click "Start AI Chat"** to test the chatbot
6. **Try typing**: "I'm feeling anxious" or "I need help"

## 🎯 What Should Work Now:

✅ **Registration & Login** - Create account and sign in  
✅ **AI Chatbot** - Interactive conversations with fallback responses  
✅ **Dashboard** - User dashboard with quick actions  
✅ **Navigation** - All buttons and links work  
✅ **Responsive Design** - Works on mobile and desktop  

## 🔧 Troubleshooting

### "Cannot connect to backend"
- Make sure MongoDB is running
- Check if port 5000 is available
- Restart the application: `npm run dev`

### "AI Chat not responding"
- The chatbot will work with fallback responses even without OpenAI API key
- To get real AI responses, add your OpenAI API key to `server/.env`

### "Registration fails"
- Check MongoDB connection
- Look at browser console for errors
- Ensure backend is running on port 5000

## 🎉 Success!
If you can register, login, and chat with the AI bot, everything is working perfectly!

## Next Steps:
1. **Get OpenAI API Key** from https://platform.openai.com/
2. **Add it to** `server/.env` file
3. **Restart the application** for real AI responses
4. **Explore other features** like appointments and resources

---
**Need help?** Check the main README.md for detailed documentation.
