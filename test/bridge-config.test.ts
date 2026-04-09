import { describe, expect, it } from "vitest";
import {
  buildChromeDevtoolsMcpArgs,
  resolveBridgeLaunchOptions,
} from "../src/bridge-config.js";

describe("buildChromeDevtoolsMcpArgs", () => {
  it("builds attach mode args for an existing browser", () => {
    const args = buildChromeDevtoolsMcpArgs({
      headless: false,
      isolated: false,
      autoConnect: false,
      browserUrl: "http://127.0.0.1:9222",
    });

    expect(args).toEqual([
      "-y",
      "chrome-devtools-mcp@latest",
      "--browserUrl=http://127.0.0.1:9222",
    ]);
  });

  it("builds launch mode args for a headed isolated browser", () => {
    const args = buildChromeDevtoolsMcpArgs({
      headless: false,
      isolated: true,
      autoConnect: false,
    });

    expect(args).toEqual([
      "-y",
      "chrome-devtools-mcp@latest",
      "--isolated",
    ]);
  });
  it("builds autoConnect args for a local Chrome session", () => {
    const args = buildChromeDevtoolsMcpArgs({
      headless: true,
      isolated: true,
      autoConnect: true,
    });

    expect(args).toEqual([
      "-y",
      "chrome-devtools-mcp@latest",
      "--autoConnect",
    ]);
  });
});

describe("resolveBridgeLaunchOptions", () => {
  it("prefers environment overrides", () => {
    const options = resolveBridgeLaunchOptions({
      CHROME_DEVTOOLS_AXI_HEADLESS: "false",
      CHROME_DEVTOOLS_AXI_ISOLATED: "false",
      CHROME_DEVTOOLS_AXI_AUTO_CONNECT: "true",
      CHROME_DEVTOOLS_AXI_BROWSER_URL: "http://127.0.0.1:9222",
    });

    expect(options).toEqual({
      headless: false,
      isolated: false,
      autoConnect: true,
      browserUrl: "http://127.0.0.1:9222",
    });
  });
});
