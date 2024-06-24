import { describe, it, expect } from "bun:test";

import { shakeFile } from "../src/main";
import { expectNoTypeScriptErrors } from "./utils";

describe("complex component w/ nav call", () => {
  it("should remove everything except the component function and nav call", async () => {
    const code = await shakeFile("fixtures/complex-component.tsx");
    expect(code).toMatchSnapshot();
    expectNoTypeScriptErrors(code);
  });
});
