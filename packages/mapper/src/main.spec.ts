import { describe, it, expect } from "bun:test";
import { mapProject } from "./main";

describe("mapProject", () => {
  it("should return", () => {
    const { fileMaps } = mapProject("submodules/react-navigation/example/src");
    expect(fileMaps).toMatchSnapshot();
  });
});
