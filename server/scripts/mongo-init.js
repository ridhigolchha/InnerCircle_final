// MongoDB initialization script
db = db.getSiblingDB('psychology_intervention');

// Create collections
db.createCollection('users');
db.createCollection('appointments');
db.createCollection('resources');
db.createCollection('forumposts');
db.createCollection('chatsessions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "studentId": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "role": 1 });

db.appointments.createIndex({ "student": 1, "scheduledDate": 1 });
db.appointments.createIndex({ "counselor": 1, "scheduledDate": 1 });
db.appointments.createIndex({ "status": 1, "scheduledDate": 1 });

db.resources.createIndex({ "category": 1, "language": 1, "isActive": 1 });
db.resources.createIndex({ "tags": 1 });
db.resources.createIndex({ "title": "text", "description": "text" });

db.forumposts.createIndex({ "category": 1, "status": 1, "createdAt": -1 });
db.forumposts.createIndex({ "author": 1, "createdAt": -1 });
db.forumposts.createIndex({ "title": "text", "content": "text" });
db.forumposts.createIndex({ "isPinned": -1, "createdAt": -1 });

db.chatsessions.createIndex({ "user": 1, "createdAt": -1 });
db.chatsessions.createIndex({ "sessionId": 1 });
db.chatsessions.createIndex({ "status": 1, "emergencyLevel": 1 });
db.chatsessions.createIndex({ "followUpRequired": 1, "followUpDate": 1 });

// Create admin user
db.users.insertOne({
  email: "admin@psychology-intervention.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4QZ8K8K8K8", // password: admin123
  firstName: "System",
  lastName: "Administrator",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully!');
