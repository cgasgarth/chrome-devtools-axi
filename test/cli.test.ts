import { describe, it, expect } from "vitest";
import {
  formatStopOutput,
  formatScreenshotOutput,
  getCommandHelp,
  parseScreenshotArgs,
  parseStartArgs,
} from "../src/cli.js";

describe("formatStopOutput", () => {
  it("returns stopped status when bridge was running", () => {
    const output = formatStopOutput(true);
    expect(output).toContain("stopped");
    expect(output).not.toContain("no-op");
  });

  it("returns no-op status when bridge was not running", () => {
    const output = formatStopOutput(false);
    expect(output).toContain("no-op");
  });
});

describe("getCommandHelp", () => {
  it("returns help text for known commands", () => {
    const help = getCommandHelp("open");
    expect(help).toContain("open");
    expect(help).toContain("--full");
    expect(help).toContain("example");
  });

  it("returns null for unknown commands", () => {
    expect(getCommandHelp("nonexistent")).toBeNull();
  });

  it("includes --full flag for snapshot-producing commands", () => {
    for (const cmd of ["open", "snapshot", "click", "fill", "type", "press", "scroll", "back"]) {
      expect(getCommandHelp(cmd)).toContain("--full");
    }
  });

  it("does not include --full for non-snapshot commands", () => {
    expect(getCommandHelp("eval")).not.toContain("--full");
    expect(getCommandHelp("start")).not.toContain("--full");
    expect(getCommandHelp("stop")).not.toContain("--full");
  });

  it("has help for all 13 commands", () => {
    const commands = ["open", "snapshot", "screenshot", "click", "fill", "type", "press", "scroll", "back", "wait", "eval", "start", "stop"];
    for (const cmd of commands) {
      expect(getCommandHelp(cmd)).not.toBeNull();
    }
  });

  it("screenshot help includes flags", () => {
    const help = getCommandHelp("screenshot");
    expect(help).toContain("--uid");
    expect(help).toContain("--full-page");
    expect(help).toContain("--format");
  });
});

describe("parseScreenshotArgs", () => {
  it("parses path only", () => {
    const result = parseScreenshotArgs(["./shot.png"]);
    expect(result).toEqual({ filePath: "./shot.png", uid: undefined, fullPage: false, format: undefined });
  });

  it("parses all flags", () => {
    const result = parseScreenshotArgs(["./shot.jpg", "--uid", "@3", "--full-page", "--format", "jpeg"]);
    expect(result).toEqual({ filePath: "./shot.jpg", uid: "3", fullPage: true, format: "jpeg" });
  });

  it("strips @ prefix from uid", () => {
    const result = parseScreenshotArgs(["out.png", "--uid", "@12"]);
    expect(result.uid).toBe("12");
  });

  it("returns null filePath when missing", () => {
    const result = parseScreenshotArgs(["--full-page"]);
    expect(result.filePath).toBeNull();
  });
});

describe("formatScreenshotOutput", () => {
  it("includes file path in output", () => {
    const output = formatScreenshotOutput("./shot.png");
    expect(output).toContain("./shot.png");
  });
});

describe("parseStartArgs", () => {
  it("parses headed attach mode", () => {
    const result = parseStartArgs([
      "--headed",
      "--autoConnect",
      "--browser-url",
      "http://127.0.0.1:9222",
      "--shared-profile",
    ]);

    expect(result).toEqual({
      headless: false,
      autoConnect: false,
      browserUrl: "http://127.0.0.1:9222",
      isolated: false,
    });
  });

  it("parses autoConnect mode", () => {
    const result = parseStartArgs(["--autoConnect"]);

    expect(result).toEqual({ autoConnect: true });
  });

  it("rejects a missing browser URL", () => {
    expect(() => parseStartArgs(["--browser-url"])).toThrow(
      "Missing browser URL",
    );
  });
});
