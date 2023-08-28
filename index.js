import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import routes from './src/routes/v1/routes.js';
dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());

app.use('/api/v1', routes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server started and running on port ${port}🚀🚀🚀🚀`);
});

export default app;
