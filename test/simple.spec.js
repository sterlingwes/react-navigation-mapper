import { describe, it, expect } from "bun:test";

import { shakeFile } from "../src/main";
import { expectNoTypeScriptErrors } from "./utils";

describe("simple react nav example", () => {
  it("should remove everything except things stemming from allowed imports", async () => {
    const code = await shakeFile("fixtures/simple-nav.js");
    expect(code).toMatchSnapshot();
    expectNoTypeScriptErrors(code);
  });
});
