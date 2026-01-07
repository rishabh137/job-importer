import jobQueue from "../queues/job.queue.js";
import Job from "../models/job.js";

jobQueue.process(5, async (job) => {
  try {
    const data = job.data;

    await Job.updateOne(
      { externalId: data.externalId },
      { $set: data },
      { upsert: true }
    );

  } catch (err) {
    console.error("Worker failed for job:", job.data.externalId, err.message);
    throw err;
  }
});
