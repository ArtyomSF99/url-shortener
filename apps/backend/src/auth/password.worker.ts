import * as bcrypt from 'bcrypt';
import { parentPort, workerData } from 'worker_threads';

/**
 * Worker thread for comparing passwords using bcrypt.
 */
async function comparePasswords() {
  const { password, hash } = workerData;

  const isMatch = await bcrypt.compare(password, hash);
  
  if (parentPort) {
    parentPort.postMessage(isMatch);
  }
}

comparePasswords();