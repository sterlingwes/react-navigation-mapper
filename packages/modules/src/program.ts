import * as ts from "typescript";
import * as path from "path";
import { globSync } from "glob";

type FileLookup = {
  [fileName: string]: {
    dependsOn: [string, string][];
  };
};

interface DrilldownOptions {
  onSourceFile?: (sourceFile: ts.SourceFile) => void;
}

interface ModuleOptions extends DrilldownOptions {
  moduleSearchLocations: string[];
  rootPath: string;
  files: FileLookup;
}

interface ProgramLookupOptions extends DrilldownOptions {
  rootPath?: string;
}

export const createProgramLookup = (
  projectPath: string,
  options?: ProgramLookupOptions
) => {
  const files: FileLookup = {};
  const basePath = projectPath.startsWith("./")
    ? projectPath
    : `./${projectPath}`;
  const paths = globSync(`${basePath}/**/*.tsx`);
  const rootPath = (options?.rootPath ?? path.dirname(__dirname)) + "/";

  const program = compile(paths, {
    ...options,
    moduleSearchLocations: [basePath],
    rootPath,
    files,
  });
  return { program, files };
};

function compile(sourceFiles: string[], moduleOptions: ModuleOptions) {
  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.AMD,
    target: ts.ScriptTarget.ES5,
  };
  const host = createCompilerHost(compilerOptions, moduleOptions);
  const program = ts.createProgram(sourceFiles, compilerOptions, host);
  return program;
}

function createCompilerHost(
  compilerOptions: ts.CompilerOptions,
  moduleOptions: ModuleOptions
): ts.CompilerHost {
  return {
    getSourceFile: (fileName, languageVersion, onError) => {
      const sourceFile = getSourceFile(fileName, languageVersion, onError);
      if (sourceFile && moduleOptions.onSourceFile) {
        moduleOptions.onSourceFile(sourceFile);
      }
      return sourceFile;
    },
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
    languageVersion: ts.ScriptTarget | ts.CreateSourceFileOptions,
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
    const containingFileLocalPath = containingFile.replace(
      moduleOptions.rootPath,
      ""
    );

    let file = moduleOptions.files[containingFileLocalPath];
    if (!file) {
      file = moduleOptions.files[containingFileLocalPath] = {
        dependsOn: [],
      };
    }

    for (const moduleName of moduleNames) {
      // try to use standard resolution
      let result = ts.resolveModuleName(
        moduleName,
        containingFile,
        compilerOptions,
        {
          fileExists,
          readFile,
        }
      );
      if (result.resolvedModule) {
        file.dependsOn.push([
          moduleName,
          result.resolvedModule.resolvedFileName.replace(
            moduleOptions.rootPath,
            ""
          ),
        ]);
        resolvedModules.push(result.resolvedModule);
      } else {
        // check fallback locations, for simplicity assume that module at location
        // should be represented by '.d.ts' file
        for (const location of moduleOptions.moduleSearchLocations) {
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
