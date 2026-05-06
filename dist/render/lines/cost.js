import { resolveSessionCost, formatUsd } from '../../cost.js';
import { label } from '../colors.js';
import { getHistoricalCost } from './historical-cost.js';
export function renderCostEstimate(ctx) {
    if (ctx.config?.display?.showCost !== true) {
        return null;
    }
    const parts = [];
    const cost = resolveSessionCost(ctx.stdin, ctx.transcript.sessionTokens);
    if (cost) {
        parts.push(`s: ${formatUsd(cost.totalUsd)}`);
    }
    const historical = getHistoricalCost();
    if (historical) {
        if (historical.dayCost > 0) {
            parts.push(`1d: ${formatUsd(historical.dayCost)}`);
        }
        if (historical.weekCost > 0) {
            parts.push(`7d: ${formatUsd(historical.weekCost)}`);
        }
        if (historical.monthCost > 0) {
            parts.push(`30d: ${formatUsd(historical.monthCost)}`);
        }
    }
    if (parts.length === 0)
        return null;
    return label(`💰 ${parts.join(' | ')}`, ctx.config?.colors);
}
//# sourceMappingURL=cost.js.map