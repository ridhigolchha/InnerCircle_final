# Digital Psychological Intervention System

A comprehensive web-based platform providing AI-guided mental health support, confidential counseling services, educational resources, and peer support for students.

## 🌟 Features

### 1. AI-Guided First-Aid Support
- **Interactive Chat Bot**: Powered by OpenAI GPT-3.5-turbo for immediate emotional support
- **Risk Assessment**: Real-time analysis of mental health risk levels
- **Coping Strategies**: Personalized interventions and techniques
- **Professional Referrals**: Automatic escalation to human counselors when needed
- **24/7 Availability**: Round-the-clock support for students

### 2. Confidential Booking System
- **Secure Appointments**: Book sessions with on-campus counselors
- **Multiple Formats**: Office, online, or phone consultations
- **Availability Management**: Real-time counselor availability
- **Confidentiality Levels**: Standard, high, and strict privacy settings
- **Emergency Scheduling**: Priority booking for urgent cases

### 3. Psychoeducational Resource Hub
- **Multimedia Content**: Videos, audio guides, documents, and articles
- **Regional Languages**: Support for English, Hindi, Tamil, Telugu, and Bengali
- **Categorized Resources**: Anxiety, depression, stress, relationships, academic support
- **Accessibility Features**: Subtitles, transcripts, and audio descriptions
- **Progress Tracking**: View counts, likes, and download statistics

### 4. Peer Support Platform
- **Moderated Forums**: Safe spaces for peer-to-peer discussions
- **Anonymous Posting**: Option to post anonymously for privacy
- **Trained Volunteers**: Student volunteers with mental health training
- **Category-based Discussions**: Organized by mental health topics
- **Reporting System**: Community-driven content moderation

### 5. Admin Dashboard
- **Anonymous Analytics**: Privacy-compliant data insights
- **User Management**: Manage students, counselors, and volunteers
- **Content Moderation**: Approve resources and moderate forum content
- **Trend Analysis**: Identify patterns and plan interventions
- **Export Capabilities**: Generate reports for institutional use

## 🛠️ Technology Stack

### Frontend
- **React.js 18**: Modern UI framework with hooks and context
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **React Hot Toast**: User-friendly notifications
- **Chart.js/Recharts**: Data visualization and analytics
- **Lucide React**: Beautiful icon library

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: Secure authentication and authorization
- **bcryptjs**: Password hashing and security
- **Express Rate Limit**: API rate limiting
- **Helmet**: Security middleware
- **Socket.io**: Real-time communication (future enhancement)

### AI/NLP Integration
- **OpenAI API**: GPT-3.5-turbo for conversational AI
- **Risk Assessment**: Custom algorithms for mental health evaluation
- **Sentiment Analysis**: Mood and emotional state detection
- **Topic Extraction**: Automatic categorization of discussions
- **Intervention Suggestions**: AI-powered coping strategy recommendations

### Additional Tools
- **Cloudinary**: Media file storage and management
- **Nodemailer**: Email notifications and communications
- **Express Validator**: Input validation and sanitization
- **Connect-Mongo**: Session storage
- **Multer**: File upload handling

## 📁 Project Structure

```
digital-psychological-intervention-system/
├── client/                          # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Layout.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/                # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   └── ChatContext.js
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Chat.js
│   │   │   ├── Appointments.js
│   │   │   ├── Resources.js
│   │   │   ├── Forum.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── Profile.js
│   │   │   └── NotFound.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── server/                          # Node.js backend
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/                      # MongoDB schemas
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── Resource.js
│   │   ├── ForumPost.js
│   │   └── ChatSession.js
│   ├── routes/                      # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── appointments.js
│   │   ├── resources.js
│   │   ├── forum.js
│   │   ├── chat.js
│   │   └── admin.js
│   ├── services/
│   │   └── openaiService.js
│   ├── index.js
│   └── package.json
├── package.json                     # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- OpenAI API key
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-psychological-intervention-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/psychology_intervention
   JWT_SECRET=your_jwt_secret_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   SESSION_SECRET=your_session_secret_here
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately
   npm run server  # Backend on port 5000
   npm run client  # Frontend on port 3000
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api/health

## 🔧 Configuration

### Database Configuration
The application uses MongoDB with the following collections:
- `users`: User accounts and profiles
- `appointments`: Counseling appointments
- `resources`: Educational content
- `forumposts`: Peer support discussions
- `chatsessions`: AI chat interactions

### AI Configuration
Configure OpenAI API settings in `server/services/openaiService.js`:
- Model: GPT-3.5-turbo
- Temperature: 0.7 (balanced creativity)
- Max tokens: 500 (response length)
- Safety protocols: Built-in risk assessment

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet security headers

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Chat System
- `POST /api/chat/start` - Start new chat session
- `POST /api/chat/message` - Send message
- `GET /api/chat/session/:id` - Get session details
- `POST /api/chat/end` - End chat session
- `GET /api/chat/history` - Get user's chat history

### Appointments
- `GET /api/appointments/counselors` - Get available counselors
- `GET /api/appointments/availability/:id` - Get counselor availability
- `POST /api/appointments/book` - Book appointment
- `GET /api/appointments/my-appointments` - Get user's appointments
- `PUT /api/appointments/:id` - Update appointment

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource details
- `POST /api/resources` - Create new resource
- `PUT /api/resources/:id` - Update resource
- `POST /api/resources/:id/like` - Like resource
- `POST /api/resources/:id/download` - Download resource

### Forum
- `GET /api/forum` - Get forum posts
- `POST /api/forum` - Create new post
- `POST /api/forum/:id/comments` - Add comment
- `POST /api/forum/:id/like` - Like post
- `POST /api/forum/:id/report` - Report post

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/analytics/*` - Various analytics endpoints
- `GET /api/admin/export/:type` - Data export

## 🎨 UI Components

### Design System
- **Color Palette**: Primary blues, success greens, warning yellows, danger reds
- **Typography**: Inter font family for modern readability
- **Spacing**: Consistent 4px grid system
- **Components**: Reusable button, card, input, and badge components
- **Responsive**: Mobile-first design with breakpoints

### Key Pages
- **Home**: Landing page with feature overview
- **Dashboard**: User dashboard with quick actions and stats
- **Chat**: AI conversation interface with risk assessment
- **Appointments**: Booking and management interface
- **Resources**: Content browsing and management
- **Forum**: Peer support discussions
- **Admin**: Analytics and management tools

## 🔒 Security & Privacy

### Data Protection
- **Encryption**: All passwords hashed with bcrypt
- **Sessions**: Secure session management with MongoDB store
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Sanitizes all user inputs

### Privacy Features
- **Anonymous Chat**: Option for anonymous AI interactions
- **Confidentiality Levels**: Different privacy settings for appointments
- **Data Anonymization**: Admin analytics use anonymized data
- **Secure Storage**: Sensitive data encrypted at rest

### Compliance
- **FERPA**: Educational privacy compliance
- **HIPAA**: Healthcare privacy considerations
- **GDPR**: Data protection and user rights
- **Audit Trails**: Comprehensive logging for accountability

## 🧪 Testing

### Test Structure
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Integration tests
npm run test:integration
```

### Test Coverage
- Unit tests for all models and services
- Integration tests for API endpoints
- Frontend component testing
- End-to-end user journey tests

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd server
npm start
```

### Environment Variables
Set the following production environment variables:
- `NODE_ENV=production`
- `MONGODB_URI=<production-mongodb-url>`
- `JWT_SECRET=<strong-production-secret>`
- `OPENAI_API_KEY=<production-openai-key>`
- `CLOUDINARY_*=<production-cloudinary-credentials>`

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Cloud Deployment
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3
- **Backend**: Deploy to Heroku, AWS EC2, or Google Cloud
- **Database**: Use MongoDB Atlas or AWS DocumentDB
- **CDN**: CloudFront or CloudFlare for static assets

## 📈 Performance Optimization

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization
- Service worker for offline functionality

### Backend Optimization
- Database indexing for faster queries
- Redis caching for frequently accessed data
- API response compression
- Connection pooling for database

### Monitoring
- Application performance monitoring
- Error tracking and logging
- User analytics (privacy-compliant)
- System health checks

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- ESLint configuration for consistent code style
- Prettier for code formatting
- Conventional commits for commit messages
- Comprehensive documentation

### Pull Request Process
- All tests must pass
- Code coverage maintained
- Documentation updated
- Security review for sensitive changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- API documentation available at `/api/docs`
- Component library documentation
- Deployment guides
- Troubleshooting guides

### Contact
- **Technical Issues**: Create an issue on GitHub
- **Security Concerns**: Email security@example.com
- **General Questions**: Contact support@example.com

### Emergency Resources
If you're experiencing a mental health crisis:
- **National Crisis Hotline**: 988
- **Emergency Services**: 911
- **Crisis Text Line**: Text HOME to 741741

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: React Native version
- **Video Counseling**: Integrated video calling
- **AI Voice**: Voice-based chat interface
- **Gamification**: Wellness tracking and rewards
- **Integration**: LMS and student information systems
- **Advanced Analytics**: Machine learning insights
- **Multi-language**: Expanded language support
- **Accessibility**: Enhanced accessibility features

### Technical Improvements
- **Microservices**: Break down into smaller services
- **Real-time**: WebSocket implementation
- **Caching**: Redis integration
- **Search**: Elasticsearch integration
- **Monitoring**: Comprehensive observability
- **CI/CD**: Automated deployment pipeline

---

**Built with ❤️ for student mental health and wellbeing**

This platform represents a comprehensive approach to digital mental health intervention, combining cutting-edge AI technology with human-centered design to provide accessible, confidential, and effective support for students in need.
