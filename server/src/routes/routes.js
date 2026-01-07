import express from "express";
import ImportLog from "../models/importLog.js";
import fetchJobsFromAPI from "../services/jobFetcher.service.js";

const router = express.Router();

router.get("/import-logs", async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;
  
    const [logs, total] = await Promise.all([
      ImportLog.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      ImportLog.countDocuments(),
    ]);
  
    res.json({
      data: logs,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  });
  

router.post("/import-jobs", async (req, res) => {
  const SOURCES = [
    "https://jobicy.com/?feed=job_feed",
    "https://www.higheredjobs.com/rss/articleFeed.cfm",
  ];

    try {
        for (const url of SOURCES) {
            await fetchJobsFromAPI(url);
        }

        res.json({
            message: "Job import triggered successfully",
        });
    } catch (error) {
        console.error("IMPORT API ERROR:", error);
        res.status(500).json({
            message: "Failed to trigger job import",
            error: error?.message || String(error),
        });
    }
  
});

export default router;
