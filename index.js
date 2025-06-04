const express = require("express");
const client = require("prom-client"); // metrices collection
const { doSomeHeavyTask } = require("./utils");
const responseTime = require("response-time");


// winston 
const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki"); 


const options = {
  transports: [
    new LokiTransport({
      host: "http://127.0.0.1:3100"
    })
  ]
};
const logger = createLogger(options);

const app = express();
const PORT = process.env.PORT || 8000;

// default metrices
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

app.get("/", async (req, res) => {
  logger.info("hello this is /route and I am in logger");
    logger.info('Request came on / route')
  return res.json({
    message: "Welcome to the express app",
  });
});



const reqResTime = new client.Histogram({
  name: "http_express_req_res_time",
  help: "Request and Response time in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [
    1, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500,
  ],
}); 

// total request count 
const totalRequestCount = new client.Counter({
    name: 'total_request_count',
    help: 'Total number of requests received',

})

app.use(
  responseTime((req, res, time) => {
    totalRequestCount.inc(); // increment the total request count
    reqResTime
      .labels({
        method: req.method,
        route: req.route ? req.route.path : req.url,
        status_code: res.statusCode,
      })
      .observe(time); // observe the time taken for the request
  })
);  

// route fro throw metrices
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);

  const metrices = await client.register.metrics();

  res.send(metrices);
});


app.get("/slow", async (req, res) => {
  try {
      logger.info('Request came on /slow route')
    const timeTaken = await doSomeHeavyTask();
    return res.json({
      message: "Heavy task completed",
      timeTaken: `${timeTaken} ms`,
    });
  } catch (error) {
    logger.error(error.message)
    // console.error("Error occurred:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
