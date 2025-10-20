import express from 'express';
import colors from 'colors';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRouter from './routers/router.js';
import { info } from './utils/logger.js';
import limitRate from 'express-rate-limit';



const app = express();
const PORT = 3000;

// Rate Limiting Middleware
const limiter = limitRate({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});


app.use(limiter);

// Application Middleware Setup
app.use(cors());
app.use(bodyParser.json());


// Logging Middleware
app.use((req, res, next) => {
  // Log incoming requests
  info(`Incoming request: ${req.method} ${req.url} `.bgCyan);
  next();
});

// Express Routes Setup
app.use('/', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`.bgGreen.white);
});