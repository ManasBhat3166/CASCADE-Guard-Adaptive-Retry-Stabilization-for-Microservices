# CASCADE-GUARD
Adaptive Retry Stabilization Framework for Node.js Microservices

## Problem
In distributed systems, retries are used to improve reliability.
However, during failures retries increase traffic load and may trigger cascading failures.

This project experimentally proves retry-induced instability and introduces an adaptive retry controller.

## Key Idea
Instead of retrying more → retry smarter.

The gateway dynamically adjusts retry attempts based on system utilization.

## Features
- Failure injection environment
- Load amplification detection
- Adaptive retry reduction
- Circuit breaker stabilization
- Experimental MTTR measurement

## Architecture
Gateway → Backend Service → Failure Injection

## How to Run
Install dependencies
npm install

Run backend
node backend.js

Run adaptive gateway
node gateway.js

Run experiment
node experiment.js

## Result
System stabilizes automatically under high failure probability.

## Research Contribution
Defines stability boundary for retry-induced cascading failure and validates adaptive retry control experimentally.

## Tech Stack
Node.js, Express, Axios, Distributed Systems, Fault Tolerance

## Authors
Manas Bhat  
Jainish Shah
