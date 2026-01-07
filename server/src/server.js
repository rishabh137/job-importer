import express from "express";
import cors from "cors";

import dotenv from "dotenv";
import connectDB from "./config/db.js";

import "./workers/job.worker.js";
import "./cron/job.cron.js";
import importRoutes from "./routes/routes.js";
const app = express();

app.use(cors());

dotenv.config();


app.use(express.json());
app.use("/api", importRoutes);

await connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
