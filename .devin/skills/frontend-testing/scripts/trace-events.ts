#!/usr/bin/env npx tsx
/**
 * Trace Events Query Tool
 *
 * Reads Playwright trace JSONL files and filters events.
 *
 * Usage:
 *   npx tsx trace-events.ts <trace-dir> [options]
 *
 * Options:
 *   --file <test|trace>    Which file set to read: "test" → test.trace,
 *                           "trace" → 0-trace.trace + 0-trace.network (default: both)
 *   --type <types>          Comma-separated event types to include (e.g. console,error,after)
 *   --errors-only           Show only events that contain error information
 *   --limit <n>             Max number of events to output (default: unlimited)
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// ── CLI parsing ──────────────────────────────────────────────────────

const args = process.argv.slice(2);

function flag(name: string): boolean {
	const position = args.indexOf(name);
	if (position === -1) return false;
	args.splice(position, 1);
	return true;
}

function option(name: string): string | undefined {
	const position = args.indexOf(name);
	if (position === -1 || position + 1 >= args.length) return undefined;
	const optionValue = args[position + 1];
	args.splice(position, 2);
	return optionValue;
}

const errorsOnly = flag('--errors-only');
const fileScope = option('--file'); // "test" | "trace" | undefined (both)
const typeArg = option('--type'); // comma-separated
const limitArg = option('--limit');
const maxEvents = limitArg ? parseInt(limitArg, 10) : Infinity;
const allowedTypes = typeArg ? new Set(typeArg.split(',').map((typeName) => typeName.trim())) : null;

const traceDir = args[0];

if (!traceDir) {
	console.error(
		'Usage: npx tsx trace-events.ts <trace-dir> [--file test|trace] [--type <types>] [--errors-only] [--limit <n>]',
	);
	process.exit(1);
}

if (!existsSync(traceDir)) {
	console.error(`Error: trace directory not found: ${traceDir}`);
	process.exit(1);
}

// ── Resolve files to read ────────────────────────────────────────────

function resolveFiles(dir: string): string[] {
	const files: string[] = [];
	const entries = readdirSync(dir);

	if (!fileScope || fileScope === 'test') {
		const testTrace = entries.find((entry) => entry === 'test.trace');
		if (testTrace) files.push(join(dir, testTrace));
	}

	if (!fileScope || fileScope === 'trace') {
		// Include all 0-trace.* files (trace, network, stacks)
		for (const entry of entries) {
			if (/^\d+-trace\.(trace|network|stacks)$/.test(entry)) {
				files.push(join(dir, entry));
			}
		}
	}

	return files;
}

const filesToRead = resolveFiles(traceDir);

if (filesToRead.length === 0) {
	console.error(`No trace files found in ${traceDir} for --file ${fileScope ?? 'all'}`);
	process.exit(1);
}

// ── ANSI strip ───────────────────────────────────────────────────────

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m/g;

function stripAnsi(value: unknown): unknown {
	if (typeof value === 'string') return value.replace(ANSI_RE, '');
	if (Array.isArray(value)) return value.map(stripAnsi);
	if (value && typeof value === 'object') {
		const cleaned: Record<string, unknown> = {};
		for (const [key, nested] of Object.entries(value)) {
			cleaned[key] = stripAnsi(nested);
		}
		return cleaned;
	}
	return value;
}

// ── Event filtering ──────────────────────────────────────────────────

interface TraceEvent {
	type?: string;
	error?: unknown;
	[key: string]: unknown;
}

function hasError(event: TraceEvent): boolean {
	if (event.error) return true;
	if (event.type === 'error') return true;
	return false;
}

function matchesFilter(event: TraceEvent): boolean {
	if (allowedTypes && !allowedTypes.has(event.type ?? '')) return false;
	if (errorsOnly && !hasError(event)) return false;
	return true;
}

// ── Main ─────────────────────────────────────────────────────────────

const results: unknown[] = [];

for (const filePath of filesToRead) {
	const content = readFileSync(filePath, 'utf-8');
	for (const line of content.split('\n')) {
		if (!line.trim()) continue;
		try {
			const event: TraceEvent = JSON.parse(line);
			if (!matchesFilter(event)) continue;
			results.push(stripAnsi(event));
			if (results.length >= maxEvents) break;
		} catch {
			// skip malformed lines
			console.error(`Error parsing line: ${line}`);
		}
	}
	if (results.length >= maxEvents) break;
}

console.log(JSON.stringify(results, null, 2));
