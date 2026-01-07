import cron from "node-cron";
import fetchJobsFromAPI from "../services/jobFetcher.service.js";

const SOURCES = [
  "https://jobicy.com/?feed=job_feed",
  "https://www.higheredjobs.com/rss/articleFeed.cfm",
];

cron.schedule("0 * * * *", async () => {
  for (const url of SOURCES) {
    await fetchJobsFromAPI(url);
  }
});
