const express = require('express');
const client = require('prom-client'); // metrices collection 
const {doSomeHeavyTask} = require(('./utils'));

const app = express();
const PORT = process.env.PORT || 3000;  

// default metrices 
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });  



app.get('/', async (req, res) => {
   return res.json({
        "message": "Welcome to the express app",
   })
}); 

app.get('/slow', async (req,res) => {
    try{
      const timeTaken = await doSomeHeavyTask();
      return res.json({
            message: "Heavy task completed",
            timeTaken: `${timeTaken} ms`
      })
    }catch(error){
        console.error('Error occurred:', error);
        return res.status(500).json({
            message: "Internal server error."
        });
    }
})  


// route fro throw metrices 
app.get('/metrics', async (req,res) => {
    res.setHeader('Content-Type', client.register.contentType);

    const metrices = await client.register.metrics();

    res.send(metrices)
})
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});