import { writeFileSync, appendFileSync, readFileSync } from 'fs';
import { join, basename, extname, dirname } from 'path';

const mangled_sdfg87dgksd_processOnce: string[] = []; // Array holds files which had '#pragma once'

export function mergeFiles(file: string): void {
    const outputFile: string = getOutputFile(file);
    writeFileSync(outputFile, '');

    processFile(file, outputFile, false);
}

export function getOutputFile(file: string): string {
    const outName: string = basename(file, extname(file)) + "-merged" + extname(file);
    return join(dirname(file), outName);
}

function processFile(file: string, outputFile: string, include: boolean): void {
    const extName: string = extname(file);
    const directory: string = dirname(file);

    if ((extName === ".hpp" || extName === ".h") && !include) { // Only include hpp files if they are included
        return;
    } else if (extName === ".cpp") {
        console.log('Processing ' + file);
        appendFileSync(outputFile, "/*-- File: " + file + " start --*/\n");
    } else if (extName === ".hpp" || extName === ".h") {
        console.log("Including: ", file);
        appendFileSync(outputFile, "/*-- #include \"" + file + "\" start --*/\n");
    } else {
        // File can be ignored
        return;
    }

    let processedOnce: boolean = false;
    for (let i = 0; i < mangled_sdfg87dgksd_processOnce.length; i++) {
        if (mangled_sdfg87dgksd_processOnce[i] === file) {
            processedOnce = true;
            break;
        }
    }

    if (!processedOnce) {
        const fileContent: string = readFileSync(file, { encoding: "utf8" });
        const lines: string[] = fileContent.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line: string = lines[i];

            if (line.indexOf("#include \"") >= 0) {
                let includedFile: string = line.substring(line.indexOf("\"") + 1, line.lastIndexOf("\""));
                includedFile = join(directory, includedFile);
                processFile(includedFile, outputFile, true);

            } else if (line.indexOf("#pragma once") >= 0) {
                mangled_sdfg87dgksd_processOnce.push(file);

            } else {
                appendFileSync(outputFile, line + "\n");
            }
        }
    }

    if (extName === ".cpp") {
        appendFileSync(outputFile, "/*-- File: " + file + " end --*/\n");
    } else if (extName === ".hpp") {
        appendFileSync(outputFile, "/*-- #include \"" + file + "\" end --*/\n");
    }
}
