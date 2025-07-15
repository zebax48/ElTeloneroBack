const express = require('express');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require("./routes/eventRoutes");
const participantRoutes = require("./routes/participantRoutes");
const connectDB = require('./config');
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

connectDB();

// Analizar en JSON y convertir a req.body
app.use(express.json());

app.use('/api/users', userRoutes);
app.use("/api", eventRoutes);
app.use("/api", participantRoutes);
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});