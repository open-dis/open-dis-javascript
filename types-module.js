
let fs = require("fs");
let filename = "types/types.d.ts";

let typeString = fs.readFileSync(filename, { encoding: 'utf8'}).toString();
typeString = typeString.replace('declare namespace dis', 'declare module "open-dis"');

fs.writeFileSync(filename, typeString);