const express = require('express');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require("./routes/eventRoutes");
const participantRoutes = require("./routes/participantRoutes");
const votacionRoutes = require("./routes/votacionRoutes");
const connectDB = require('./config');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:3000', 'https://eltelonerosoyyo.onrender.com', 'https://el-telonero.vercel.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

connectDB();

// Analizar en JSON y convertir a req.body
app.use(express.json());

app.use('/api/users', userRoutes);
app.use("/api", eventRoutes);
app.use("/api", participantRoutes);
app.use("/api/votaciones", votacionRoutes);
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});