import fs from "fs-extra";
import _ from "lodash";
import { makeLogger } from "../lib/logging";
import { Command } from "commander";
import { startSignatory } from "..";
import { SignatoryServer } from "../lib/signatoryServer";
import { RocksStorage } from "../lib/rocksStorage";
const logger = makeLogger("ServiceRunner", "Commands");

interface ParsedCommands {
  port: string;
  dir: string;
}

const parseCommands = async (prog: Command) => {
  let dir = "./signatory";
  let port = "8557";
  if (prog.dir) { dir = prog.dir; }
  if (prog.port) { port = prog.port; }
  return { port, dir };
};

const launchCommands = async ({ port, dir }: ParsedCommands): Promise<SignatoryServer> => {
  const rocksStorage = new RocksStorage(dir);
  return startSignatory(rocksStorage, port);
};
/**
 * startSignatoryFromCLI launches the signatory with command line arguments
 * @param program - are the commandline arguments
 */
export const startSignatoryFromCLI = async (program: any): Promise<void> => {
  const commands = await parseCommands(program);
  launchCommands(commands);
};
