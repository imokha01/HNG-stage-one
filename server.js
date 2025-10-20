import express from 'express';
import colors from 'colors';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRouter from './routers/router.js';


const app = express();
const PORT = 3000;

// Application Middleware Setup
app.use(cors());
app.use(bodyParser.json());

app.get('/', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`.bgGreen.black);
});