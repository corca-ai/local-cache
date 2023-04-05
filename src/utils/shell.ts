import { exec } from "child_process";

/**
 * Execute shell script.
 * @param {String} command
 * @return {Object} { stdout: String, stderr: String }
 */

export const shell = async (command: string): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
};

export const BASE_CACHE_PATH = "/tmp/.cache";
