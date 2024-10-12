import { execFile } from "node:child_process";

// FIXME: Temp fix only. It is not clear why `fetch` isn't working but `curl` does.

const curl = (
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
  } = {},
) => {
  const {
    headers = {},
    method = "GET",
  } = options;
  const headerArgs = Object.entries(headers)
    .flatMap(([key, value]) => ["-H", `${key}: ${value}`]);

  return new Promise((res, rej) => {
    execFile(
      "curl",
      [...headerArgs, "-X", method ?? "GET", url],
      { maxBuffer: 100 * 1024 * 1024 },
      (err, stdout) => {
        if (err) {
          rej(err);
        }

        res(stdout);
      },
    );
  });
};

export default curl;
