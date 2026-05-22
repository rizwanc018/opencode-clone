import { appendFileSync } from "fs";

export default function log(...args: any[]) {
    appendFileSync("/tmp/opecode-debug.log", JSON.stringify(args) + "\n");
}
