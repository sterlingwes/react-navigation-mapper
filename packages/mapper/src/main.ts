import * as path from "path";
import { parseFile } from "@react-navigation-mapper/ast";
import { createProgramLookup } from "@react-navigation-mapper/modules";
import { logger } from "./utils/logger";

const rootPath = path.resolve(__dirname, "../../../");

export const mapProject = (projectPath: string) => {
  const fileMaps: Array<ReturnType<typeof parseFile>> = [];
  const { files } = createProgramLookup(projectPath, {
    rootPath,
    onSourceFile: (sourceFile) => {
      logger.debug(`onSourceFile(${sourceFile.fileName})`);
      const parsedFile = parseFile(sourceFile);
      if (!parsedFile.skippable) {
        fileMaps.push(parsedFile);
      }
    },
  });

  return { files, fileMaps };
};
