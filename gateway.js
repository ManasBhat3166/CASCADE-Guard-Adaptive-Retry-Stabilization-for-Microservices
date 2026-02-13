// gateway.js - THE ADAPTIVE CONTROLLER
const express = require('express');
const axios = require('axios');
const chalk = require('chalk');
const app = express();
const PORT = 3000;
const BACKEND_URL = 'http://localhost:3001/api/resource';

// --- RESEARCH CONSTANTS ---
const CAPACITY_ESTIMATE = 50; // Safety Buffer (C)
let allowedRetries = 3;       // Initial State (k)

// --- METRICS ---
let stats = { success: 0, fail: 0, total: 0 };

// --- THE MATHEMATICAL CONTROL LOOP (1Hz) ---
setInterval(() => {
    if (stats.total === 0) return;

    const P = stats.fail / stats.total; // Failure Probability
    const L = stats.total;              // Incoming Traffic (Load)
    
    // FORMULA: Total Load = L * (1 + P * k)
    const projectedLoad = L * (1 + (P * 3)); // Calculate load with standard retry policy

    // Console Dashboard
    console.log(chalk.gray("─".repeat(65)));
    console.log(chalk.cyan.bold(`📡 GATEWAY TELEMETRY [Load: ${L}/s | Fail Rate: ${(P*100).toFixed(0)}%] `));
    
    if (projectedLoad > CAPACITY_ESTIMATE) {
        console.log(chalk.yellow(`   ⚠ STABILITY WARNING: Standard retries would cause ${projectedLoad.toFixed(0)} req/s`));
        
        // ADAPTIVE CONTROL LAW
        // Solve for k: k < (C/L - 1) / P
        let optimalK = ((CAPACITY_ESTIMATE / L) - 1) / P;
        let safeK = Math.max(0, Math.min(3, Math.floor(optimalK)));

        console.log(chalk.white(`   🧮 Calculating New Threshold...`));
        console.log(`      Formula: k < (${CAPACITY_ESTIMATE}/${L} - 1) / ${P.toFixed(2)}`);
        console.log(`      Result : ${optimalK.toFixed(2)}`);
        
        if (allowedRetries !== safeK) {
            console.log(chalk.bgRed.white.bold(` ⚡ ADAPTIVE ACTION: Reducing Retries ${allowedRetries} ➔ ${safeK} `));
            allowedRetries = safeK;
        } else {
            console.log(chalk.yellow(`   ✔ Retries optimized at ${safeK}`));
        }
    } else {
        console.log(chalk.green(`   ✅ SYSTEM STABLE. Standard Retry Policy (3x) Active.`));
        // Reset to standard if stable
        if (allowedRetries !== 3) allowedRetries = 3;
    }
    console.log(chalk.gray("─".repeat(65)));

    // Reset metrics
    stats = { success: 0, fail: 0, total: 0 };
}, 1000);

// --- PROXY LOGIC WITH RETRY ---
async function proxyRequest(attempt = 0) {
    if (attempt === 0) stats.total++;

    try {
        await axios.get(BACKEND_URL, { timeout: 500 }); // 500ms timeout
        stats.success++;
        return "Success";
    } catch (error) {
        // THE DECISION POINT: Check against Adaptive Threshold
        if (attempt < allowedRetries) {
            return proxyRequest(attempt + 1); // RECURSIVE RETRY
        } else {
            stats.fail++;
            throw error; // Give up
        }
    }
}

app.get('/request', async (req, res) => {
    try {
        await proxyRequest();
        res.send("OK");
    } catch (e) {
        res.status(500).send("Unavailable");
    }
});

app.listen(PORT, () => console.log(chalk.blue("Adaptive Gateway Running...")));