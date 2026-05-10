#!/usr/bin/env bun

// copied from https://github.com/ishaksebsib/opencode-tree/blob/main/scripts/build.ts
import { rm } from "node:fs/promises";
import { createSolidTransformPlugin } from "@opentui/solid/bun-plugin";

await rm("dist", { recursive: true, force: true });

const build = await Bun.build({
    entrypoints: ["./src/tui.tsx"],
    outdir: "./dist",
    target: "bun",
    format: "esm",
    splitting: false,
    external: [
        "@opencode-ai/plugin",
        "@opencode-ai/plugin/*",
        "@opentui/core",
        "@opentui/core/*",
        "@opentui/solid",
        "@opentui/solid/*",
        "solid-js",
        "solid-js/*",
        "node:fs",
        "node:events",
    ],
    plugins: [createSolidTransformPlugin()],
});

if (!build.success) {
    for (const log of build.logs) {
        console.error(log);
    }
    process.exit(1);
}

