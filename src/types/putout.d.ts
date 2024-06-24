declare module "putout" {
  const main: (code: string, options: any) => { code: string; places: any[] };

  export const types: typeof import("@putout/babel").types;
  export default main;
}
