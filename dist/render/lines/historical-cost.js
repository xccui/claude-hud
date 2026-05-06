import { execSync } from 'child_process';
import { readFileSync, writeFileSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';
const CACHE_DIR = join(process.env.HOME || '', '.claude', 'plugins', 'claude-hud');
const CACHE_FILE = join(CACHE_DIR, 'historical-cost-cache.json');
const CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const NODE_BIN_DIR = join(process.env.HOME || '', '.local/share/fnm/node-versions/v22.22.2/installation/bin');
const CCUSAGE_PATH = join(NODE_BIN_DIR, 'ccusage');
function getCachedData() {
    try {
        const stat = statSync(CACHE_FILE);
        const age = Date.now() - stat.mtimeMs;
        if (age < CACHE_MAX_AGE_MS) {
            return JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
        }
    }
    catch { }
    return null;
}
function refreshCache() {
    try {
        mkdirSync(CACHE_DIR, { recursive: true });
        const env = { ...process.env, PATH: `${NODE_BIN_DIR}:${process.env.PATH || ''}` };
        const dailyJson = execSync(`${CCUSAGE_PATH} daily --json --since $(date +%Y%m%d)`, { encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'], env });
        const weeklyJson = execSync(`${CCUSAGE_PATH} weekly --json --since $(date -d '7 days ago' +%Y%m%d)`, { encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'], env });
        const monthlyJson = execSync(`${CCUSAGE_PATH} monthly --json --since $(date -d '30 days ago' +%Y%m%d)`, { encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'], env });
        const daily = JSON.parse(dailyJson);
        const weekly = JSON.parse(weeklyJson);
        const monthly = JSON.parse(monthlyJson);
        const dayCost = (daily.daily || []).reduce((sum, entry) => sum + (entry.totalCost ?? 0), 0);
        const weekCost = (weekly.weekly || []).reduce((sum, entry) => sum + (entry.totalCost ?? 0), 0);
        const monthCost = (monthly.monthly || []).reduce((sum, entry) => sum + (entry.totalCost ?? 0), 0);
        const data = { dayCost, weekCost, monthCost, updatedAt: Date.now() };
        writeFileSync(CACHE_FILE, JSON.stringify(data));
        return data;
    }
    catch {
        return null;
    }
}
export function getHistoricalCost() {
    let data = getCachedData();
    if (!data) {
        data = refreshCache();
    }
    return data;
}
//# sourceMappingURL=historical-cost.js.map