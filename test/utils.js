import { expect } from "bun:test";
import { createProject, ts } from "@ts-morph/bootstrap";

const expectedIssues = [
  "Cannot find global value 'Promise'",
  "Cannot find module",
  "Cannot find name 'require'",
];

const validate = async (code) => {
  const project = await createProject({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2018,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  project.createSourceFile("file.tsx", code.replace("// @ts-nocheck\n", ""));
  const program = project.createProgram();
  const allIssues = ts.getPreEmitDiagnostics(program);
  const issues = allIssues
    .filter((d) => d.category === ts.DiagnosticCategory.Error)
    .map((d) => d.messageText)
    .filter((message) =>
      expectedIssues.every((issue) => message.startsWith(issue) === false)
    );

  return issues;
};

export const expectNoTypeScriptErrors = async (code) => {
  const tsIssues = await validate(code);
  expect(tsIssues).toEqual([]);
};
