import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, unique: true },
    title: String,
    company: String,
    location: String,
    url: String,
    source: String,
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
