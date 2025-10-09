import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './utils/database.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import scheduleRoutes from './routes/schedules.js';
import userRoutes from './routes/users.js';
import facultyRoutes from './routes/faculty.js';
import enrollmentRoutes from './routes/enrollments.js';
import lectureSlotRoutes from './routes/lectureSlots.js';
import assignmentRoutes from './routes/assignments.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lecture-slots', lectureSlotRoutes);
app.use('/api/assignments', assignmentRoutes);


// ==========================
// 📌 Serve React Frontend
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to frontend build folder (after running `npm run build` in frontend)
const frontendPath = path.join(__dirname, '../../frontend/dist');

// Serve static files
app.use(express.static(frontendPath));

// Catch-all for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// // Handle 404 errors
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`,
//   });
// });

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;




// For correction after deployment
// import express from 'express'; import cors from 'cors'; import helmet from 'helmet'; import morgan from 'morgan'; import compression from 'compression'; import rateLimit from 'express-rate-limit'; import dotenv from 'dotenv'; import connectDB from './utils/database.js'; import authRoutes from './routes/auth.js'; import courseRoutes from './routes/courses.js'; import scheduleRoutes from './routes/schedules.js'; import userRoutes from './routes/users.js'; import facultyRoutes from './routes/faculty.js'; import enrollmentRoutes from './routes/enrollments.js'; import lectureSlotRoutes from './routes/lectureSlots.js'; import { errorHandler } from './middleware/errorHandler.js'; // Load environment variables dotenv.config(); const app = express(); const PORT = process.env.PORT || 5000; // Connect to MongoDB connectDB(); // Security middleware app.use(helmet()); app.use(compression()); // Rate limiting const limiter = rateLimit({ windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, message: 'Too many requests from this IP, please try again later.', standardHeaders: true, legacyHeaders: false, }); app.use('/api/', limiter); // CORS configuration const corsOptions = { origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true, optionsSuccessStatus: 200, }; app.use(cors(corsOptions)); // Logging if (process.env.NODE_ENV === 'development') { app.use(morgan('dev')); } else { app.use(morgan('combined')); } // Body parsing middleware app.use(express.json({ limit: '10mb' })); app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Health check endpoint app.get('/health', (req, res) => { res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), environment: process.env.NODE_ENV, }); }); // API routes app.use('/api/auth', authRoutes); app.use('/api/courses', courseRoutes); app.use('/api/schedules', scheduleRoutes); app.use('/api/users', userRoutes); app.use('/api/faculty', facultyRoutes); app.use('/api/enrollments', enrollmentRoutes); app.use('/api/lecture-slots', lectureSlotRoutes); // Handle 404 errors app.use('*', (req, res) => { res.status(404).json({ success: false, message: Route ${req.originalUrl} not found, }); }); // Global error handler app.use(errorHandler); // Start server app.listen(PORT, () => { console.log(🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode); }); export default app;