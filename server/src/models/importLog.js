import mongoose from "mongoose";

const importLogSchema = new mongoose.Schema({
  fileName: String,
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: [
    {
      reason: String,
      job: Object,
    },
  ],
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("ImportLog", importLogSchema);
