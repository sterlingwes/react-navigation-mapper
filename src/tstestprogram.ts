import * as ts from "typescript";
import * as path from "path";
import { globSync } from "glob";

const files: FileLookup = {};
const paths = globSync("submodules/react-navigation/example/src/**/*.tsx");
const rootPath = path.dirname(__dirname) + "/";
console.log({ paths, rootPath });
const basePath = "./submodules/react-navigation/example/src";
compile(paths, [basePath]);

type FileLookup = {
  [fileName: string]: {
    dependsOn: [string, string][];
  };
};

function createCompilerHost(
  options: ts.CompilerOptions,
  moduleSearchLocations: string[]
): ts.CompilerHost {
  return {
    getSourceFile,
    getDefaultLibFileName: () => "lib.d.ts",
    writeFile: (fileName, content) => ts.sys.writeFile(fileName, content),
    getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
    getDirectories: (path) => ts.sys.getDirectories(path),
    getCanonicalFileName: (fileName) =>
      ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
    getNewLine: () => ts.sys.newLine,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    fileExists,
    readFile,
    resolveModuleNames,
  };

  function fileExists(fileName: string): boolean {
    return ts.sys.fileExists(fileName);
  }

  function readFile(fileName: string): string | undefined {
    return ts.sys.readFile(fileName);
  }

  function getSourceFile(
    fileName: string,
    languageVersion: ts.ScriptTarget,
    onError?: (message: string) => void
  ) {
    const sourceText = ts.sys.readFile(fileName);
    return sourceText !== undefined
      ? ts.createSourceFile(fileName, sourceText, languageVersion)
      : undefined;
  }

  function resolveModuleNames(
    moduleNames: string[],
    containingFile: string
  ): ts.ResolvedModule[] {
    const resolvedModules: ts.ResolvedModule[] = [];
    const containingFileLocalPath = containingFile.replace(rootPath, "");

    let file = files[containingFileLocalPath];
    if (!file) {
      file = files[containingFileLocalPath] = {
        dependsOn: [],
      };
    }

    // console.log({ moduleNames });
    for (const moduleName of moduleNames) {
      // try to use standard resolution
      let result = ts.resolveModuleName(moduleName, containingFile, options, {
        fileExists,
        readFile,
      });
      // console.log(">>", containingFile, moduleName, result.resolvedModule);
      if (result.resolvedModule) {
        file.dependsOn.push([
          moduleName,
          result.resolvedModule.resolvedFileName.replace(rootPath, ""),
        ]);
        resolvedModules.push(result.resolvedModule);
      } else {
        // check fallback locations, for simplicity assume that module at location
        // should be represented by '.d.ts' file
        for (const location of moduleSearchLocations) {
          const modulePath = path.join(location, moduleName + ".d.ts");
          if (fileExists(modulePath)) {
            resolvedModules.push({ resolvedFileName: modulePath });
          } else {
            // TEST
            resolvedModules.push({
              resolvedFileName: `unmatched-${moduleName}.ts`,
            });
          }
        }
      }
    }
    return resolvedModules;
  }
}

function compile(sourceFiles: string[], moduleSearchLocations: string[]): void {
  // console.log({ sourceFiles, moduleSearchLocations });

  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.AMD,
    target: ts.ScriptTarget.ES5,
  };
  const host = createCompilerHost(options, moduleSearchLocations);
  const program = ts.createProgram(sourceFiles, options, host);

  console.log("> program", program.getSourceFiles().length);

  console.log(JSON.stringify(files, null, 2));

  /// do something with program...
}
