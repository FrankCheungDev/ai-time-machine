import { readFile } from "node:fs/promises";
import {
  analyzeLearningMetricsExport,
  LearningMetricsValidationError,
  renderLearningMetricsMarkdown,
} from "../packages/data/src/learning/metrics.ts";

function usage(): string {
  return [
    "Usage: pnpm analyze:learning-metrics -- <aggregate-export.json> [--format=markdown|json]",
    "",
    "The input must contain aggregate funnel counts only and pass the P2-05",
    "production, real-traffic, exclusion, observation-window, and sample contract.",
  ].join("\n");
}

function parseArguments(args: string[]): {
  inputPath: string;
  format: "markdown" | "json";
} {
  const inputPath = args.find((argument) => !argument.startsWith("--"));
  const formatArgument = args.find((argument) =>
    argument.startsWith("--format="),
  );
  const unknownArguments = args.filter(
    (argument) =>
      argument !== inputPath &&
      argument !== formatArgument &&
      argument !== "--" &&
      argument !== "--help" &&
      argument !== "-h",
  );

  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    process.exit(0);
  }
  if (!inputPath)
    throw new Error(`Missing aggregate export path.\n\n${usage()}`);
  if (unknownArguments.length > 0) {
    throw new Error(`Unknown arguments: ${unknownArguments.join(", ")}`);
  }

  const format = formatArgument?.slice("--format=".length) ?? "markdown";
  if (format !== "markdown" && format !== "json") {
    throw new Error(`Unsupported format: ${format}`);
  }

  return { inputPath, format };
}

async function main(): Promise<void> {
  const { inputPath, format } = parseArguments(process.argv.slice(2));
  const raw = await readFile(inputPath, "utf8");
  let input: unknown;

  try {
    input = JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(
      `Could not parse ${inputPath} as JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const analysis = analyzeLearningMetricsExport(input);
  console.log(
    format === "json"
      ? JSON.stringify(analysis, null, 2)
      : renderLearningMetricsMarkdown(analysis),
  );
}

main().catch((error: unknown) => {
  if (error instanceof LearningMetricsValidationError) {
    console.error(error.message);
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exitCode = 1;
});
