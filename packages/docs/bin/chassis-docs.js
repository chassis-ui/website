#!/usr/bin/env node

// The build and validation commands that every Chassis site shares. Run `chassis-docs help`.
import { main } from '../src/cli/main.js'

process.exitCode = await main(process.argv.slice(2))
