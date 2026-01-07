import Queue from "bull";

const jobQueue = new Queue("job-import-queue", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

export default jobQueue;
