// experiment.js - THE TRAFFIC GENERATOR
const axios = require('axios');
const chalk = require('chalk');

const GATEWAY = 'http://localhost:3000/request';
const ADMIN = 'http://localhost:3001/admin/failure';
const TRAFFIC_RATE = 20; 
const DURATION = 22;

async function runExperiment() {
    console.clear();
    console.log(chalk.bgBlue.white.bold(" 🔬 NODE.JS MICROSERVICE RELIABILITY EXPERIMENT 🔬 "));
    console.log(chalk.gray("Target: Microservices Architecture with Adaptive Gateway"));
    console.log("");

    // Reset System to 0% failure
    await axios.get(`${ADMIN}?p=0`); 
    
    const start = Date.now();
    let currentPhase = "NORMAL";

    const loop = setInterval(async () => {
        const elapsed = Math.floor((Date.now() - start) / 1000);
        
        // --- PHASE ORCHESTRATION ---
        if (elapsed === 0) {
            console.log(chalk.bgGreen.black.bold(" [PHASE 1] BASELINE (0-6s) "));
            console.log(chalk.green("Condition: Healthy Network."));
        }
        else if (elapsed === 7) {
            console.log("");
            console.log(chalk.bgYellow.black.bold(" [PHASE 2] MODERATE FAILURE (50%) "));
            console.log(chalk.yellow("Action: Injecting 50% Error Rate via Admin API."));
            await axios.get(`${ADMIN}?p=0.5`);
            currentPhase = "DISTURBED";
        }
        else if (elapsed === 14) {
            console.log("");
            console.log(chalk.bgRed.white.bold(" [PHASE 3] CRITICAL FAILURE (80%) "));
            console.log(chalk.red("Action: Increasing Failure to 80%."));
            console.log(chalk.red("Expectation: Adaptive Gateway will throttle retries to prevent crash."));
            await axios.get(`${ADMIN}?p=0.8`);
            currentPhase = "CRITICAL";
        }

        // --- TRAFFIC BATCH GENERATION ---
        const batchStart = Date.now();
        const promises = [];
        for(let i=0; i<TRAFFIC_RATE; i++) {
            // We catch errors here to count them instead of crashing the script
            promises.push(axios.get(GATEWAY).then(()=>'OK').catch(()=>'ERR'));
        }
        
        // Wait for all requests to finish
        const results = await Promise.all(promises);
        const duration = Date.now() - batchStart;
        
        // --- ANALYTICS ---
        const ok = results.filter(r => r === 'OK').length;
        const err = results.filter(r => r === 'ERR').length;

        // --- SCIENTIFIC LOGGING ---
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        let statusColor = currentPhase === "NORMAL" ? chalk.green : (currentPhase === "DISTURBED" ? chalk.yellow : chalk.red);

        // Format the log line precisely
        const logTime = `[${chalk.gray(timestamp)}] T+${String(elapsed).padStart(2,'0')}s`;
        const logPhase = `Phase: ${statusColor(currentPhase.padEnd(9))}`;
        const logLoad = `Load: ${TRAFFIC_RATE}`;
        const logOK = `✅ OK: ${chalk.green(String(ok).padEnd(2))}`;
        const logERR = `❌ ERR: ${chalk.red(String(err).padEnd(2))}`;
        const logLat = `⏱ Latency: ${chalk.cyan(duration + 'ms')}`;

        console.log(`${logTime} | ${logPhase} | ${logLoad} | ${logOK} | ${logERR} | ${logLat}`);

        // --- END CONDITION ---
        if (elapsed >= DURATION) {
            clearInterval(loop);
            console.log("\n" + chalk.bgBlue.white.bold(" 🏁 EXPERIMENT COMPLETE 🏁 "));
            process.exit();
        }

    }, 1000);
}

runExperiment();