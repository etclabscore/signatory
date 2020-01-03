#!/usr/bin/env node
import program from "commander";
const version = require("../../../package.json").version; // tslint:disable-line
import { makeLogger } from "../lib/logging";
import { startSignatoryFromCLI } from "./commands";
import _ from "lodash";

const logger = makeLogger("Signatory", "CLI");
program
  .version(version, "-v, --version")
  .option(
    "-d, --dir <directory>",
    "Directory for storing keys",
    "./signatory",
  )
  .option(
    "-p, --port <port>",
    "Set port for Signatory",
    "8002",
  )
  .action(async () => {
    try {
      await startSignatoryFromCLI(program);
    } catch (e) {
      logger.error("Could not start Signatory.");
      logger.debug(e.stack);
    }
  })
  .parse(process.argv);
