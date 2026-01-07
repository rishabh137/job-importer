import { retryFetch } from "../utils/retryFetch.js";
import xml2js from "xml2js";
import jobQueue from "../queues/job.queue.js";
import ImportLog from "../models/importLog.js";

const parser = new xml2js.Parser({
    explicitArray: false,
    strict: false,
    trim: true,
});

const fetchJobsFromAPI = async (url) => {
    const response = await retryFetch(url);

    const cleanXml = response.data.replace(
        /&(?!amp;|lt;|gt;|quot;|apos;)/g,
        "&amp;"
    );

    const parsed = await parser.parseStringPromise(cleanXml);

    const jobs = parsed?.rss?.channel?.item || [];

    const log = {
        fileName: url,
        totalFetched: jobs.length,
        totalImported: 0,
        newJobs: 0,
        updatedJobs: 0,
        failedJobs: [],
    };

    for (const job of jobs) {
        try {
            await jobQueue.add(
                {
                    externalId: job.link,
                    title: job.title,
                    company: job["job:company"] || "",
                    location: job["job:location"] || "",
                    url: job.link,
                    source: url,
                },
                {
                    attempts: 3,
                    backoff: {
                        type: "exponential",
                        delay: 2000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            );

            log.totalImported++;
        } catch (err) {
            log.failedJobs.push({
                reason: err.message,
                job,
            });
        }
    }

    await ImportLog.create(log);
};

export default fetchJobsFromAPI;
