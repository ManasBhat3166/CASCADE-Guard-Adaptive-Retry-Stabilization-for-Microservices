// backend.js - THE MICROSERVICE TARGET
const express = require('express');
const chalk = require('chalk');
const app = express();
const PORT = 3001;

// --- CONFIGURATION ---
const SYSTEM_CAPACITY = 60; // Max requests per second
let currentLoad = 0;
let successCount = 0;
let errorCount = 0;
let overloadCount = 0;
let failureProbability = 0.0; 

// --- REAL-TIME DASHBOARD (Runs every 1s) ---
setInterval(() => {
    // Visual Bar Logic
    const ratio = Math.min(currentLoad / SYSTEM_CAPACITY, 1.0); 
    const barLen = 40;
    const filled = Math.floor(ratio * barLen);
    const empty = Math.max(0, barLen - filled);
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    let color = chalk.green;
    let status = "OPTIMAL";
    
    // Determining System Health State
    if (currentLoad > SYSTEM_CAPACITY) { 
        color = chalk.bgRed.white.bold; 
        status = "CRASHING (DEATH SPIRAL)"; 
    } else if (currentLoad > SYSTEM_CAPACITY * 0.8) { 
        color = chalk.yellow; 
        status = "STRESSED"; 
    }

    // Console Output
    console.clear();
    console.log(chalk.gray("╔══════════════════════════════════════════════════╗"));
    console.log(chalk.gray("║") + chalk.white.bold("           BACKEND MICROSERVICE MONITOR           ") + chalk.gray("║"));
    console.log(chalk.gray("╚══════════════════════════════════════════════════╝"));
    console.log(` Health Status : ${color(" " + status + " ")}`);
    console.log(` Capacity Limit: ${chalk.white(SYSTEM_CAPACITY + " req/s")}`);
    console.log(` Failure Rate  : ${chalk.magenta((failureProbability * 100).toFixed(0) + "% (Injected)")}`);
    console.log(chalk.gray("──────────────────────────────────────────────────"));
    console.log(` Traffic Load  : ${currentLoad} req/s`);
    console.log(` Load Graph    : ${color(bar)}`);
    console.log(chalk.gray("──────────────────────────────────────────────────"));
    console.log(chalk.bold(" Metrics (Last 1s):"));
    console.log(`  ✅ Success   : ${chalk.green(successCount)}`);
    console.log(`  ❌ Failed    : ${chalk.red(errorCount)}`);
    console.log(`  🔥 Overloads : ${chalk.red.bold(overloadCount)}`);
    console.log(chalk.gray("──────────────────────────────────────────────────"));

    // Reset counters for next second
    currentLoad = 0; successCount = 0; errorCount = 0; overloadCount = 0;
}, 1000);

// --- API ENDPOINT ---
app.get('/api/resource', (req, res) => {
    currentLoad++;

    // 1. SIMULATE OVERLOAD (CPU BLOCKING / THREAD STARVATION)
    if (currentLoad > SYSTEM_CAPACITY) {
        overloadCount++;
        // When overloaded, response time spikes to 3000ms (Death Spiral)
        return setTimeout(() => res.status(503).send('Overloaded'), 3000);
    }

    // 2. SIMULATE INTERNAL FAILURE (DB ERROR)
    if (Math.random() < failureProbability) {
        errorCount++;
        return res.status(500).send('Internal Error');
    }

    // 3. SUCCESS
    successCount++;
    // Simulate slight processing time (10ms)
    setTimeout(() => res.json({ status: "OK", data: "Payload" }), 10);
});

// --- ADMIN CONTROL ---
app.get('/admin/failure', (req, res) => {
    failureProbability = parseFloat(req.query.p);
    res.send('Updated');
});

app.listen(PORT, () => console.log("Backend Service Running..."));