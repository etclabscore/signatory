import { makeLogger } from "./lib/logging";
import { SignatoryServer } from "./lib/signatoryServer";
import { Storage } from "./lib/storage";
export { getLogStream } from "./lib/logging";
const logger = makeLogger("Signatory", "startSignatory");
/**
 *
 * @param dir - where signatures should live
 * @param port - port for signatory
 */
export const startSignatory = async (storage: Storage, port: string): Promise<SignatoryServer> => {
  const signatoryServer = new SignatoryServer(storage, `${port}`);
  logger.info(`Signatory Service port starting on ${port}`);
  await signatoryServer.start();
  logger.info(`Signatory started on ${port}`);
  return signatoryServer;
};
