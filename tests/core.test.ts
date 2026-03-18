import { describe, it, expect } from "vitest";
import { Flowgraph } from "../src/core.js";
describe("Flowgraph", () => {
  it("init", () => { expect(new Flowgraph().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Flowgraph(); await c.generate(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Flowgraph(); await c.generate(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
