import { describe, expect, it } from 'vitest';
import {
  anomalies,
  chainHash,
  costOfDelay,
  forecast,
  health,
  healthBreakdown,
  isDue,
  portfolioStats,
  riskScore,
  slaState,
  status,
  verifyChain,
} from './engine.js';

const base = {
  over: 10, phys: 70, fin: 65, photo: 1,
  upd: 'field update', flagged: false,
  cost: 500, dep: [], blocker: 'None', burn: [5, 6, 5],
};

describe('health', () => {
  it('scores on-track project high', () => {
    expect(health({ ...base, over: 0, phys: 50, fin: 50 })).toBeGreaterThanOrEqual(70);
  });
  it('penalizes gap, missing photo, stall and flag', () => {
    const bad = health({ ...base, over: 40, phys: 90, fin: 40, photo: 0, upd: 'work in progress', flagged: true });
    expect(bad).toBeLessThan(45);
  });
  it('never NaNs on missing fields', () => {
    expect(Number.isFinite(health({}))).toBe(true);
    expect(Number.isFinite(health())).toBe(true);
  });
  it('clamps minimum to 4', () => {
    expect(health({ over: 999, phys: 100, fin: 0, photo: 0, flagged: true })).toBe(4);
  });
});

describe('healthBreakdown', () => {
  it('sums to score', () => {
    const p = { ...base, over: 10, phys: 80, fin: 60 };
    const { score, parts } = healthBreakdown(p);
    expect(score).toBe(health(p));
    expect(parts.length).toBe(5);
  });
});

describe('status', () => {
  it('maps thresholds', () => {
    expect(status(80).label).toBe('ON TRACK');
    expect(status(60).label).toBe('AT RISK');
    expect(status(10).label).toBe('CRITICAL');
  });
});

describe('costOfDelay', () => {
  it('scales with cost and overdue', () => {
    expect(costOfDelay({ cost: 700, over: 14 })).toBeGreaterThan(costOfDelay({ cost: 700, over: 7 }));
  });
  it('handles missing input', () => {
    expect(costOfDelay({})).toBe(0);
  });
});

describe('anomalies', () => {
  it('flags phys-fin gap', () => {
    const a = anomalies({ ...base, phys: 88, fin: 40 }, []);
    expect(a.some((x) => x.label.includes('phys-fin gap'))).toBe(true);
  });
  it('flags no-photo claim', () => {
    const a = anomalies({ ...base, phys: 70, photo: 0 }, []);
    expect(a.some((x) => x.label.includes('no photo'))).toBe(true);
  });
  it('flags repeat text and overdue', () => {
    const hist = [{ txt: 'same' }, { txt: 'same' }];
    const a = anomalies({ ...base, upd: 'same', over: 45 }, hist);
    expect(a.some((x) => x.label.includes('repeat text'))).toBe(true);
    expect(a.some((x) => x.label.includes('overdue'))).toBe(true);
  });
  it('returns empty for bad input', () => {
    expect(anomalies()).toEqual([]);
  });
});

describe('riskScore', () => {
  it('rises with critical dependencies and blockers', () => {
    const dep = { ...base, over: 60, phys: 90, fin: 40 };
    const plain = riskScore(base, { upd: {} });
    const risky = riskScore(
      { ...base, dep: ['P-118'], blocker: 'Forest clearance' },
      { upd: { 'P-118': dep } },
    );
    expect(risky).toBeGreaterThan(plain);
    expect(risky).toBeLessThanOrEqual(100);
  });
});

describe('forecast', () => {
  it('projects delay without NaN', () => {
    const f = forecast(base);
    expect(Number.isFinite(f.pace)).toBe(true);
    expect(f.monthsLeft).toBeGreaterThanOrEqual(1);
    expect(f.projectedDelay).toBeGreaterThanOrEqual(base.over);
    expect(f.trend.length).toBe(2);
  });
  it('handles empty burn', () => {
    const f = forecast({ phys: 50, over: 5 });
    expect(Number.isFinite(f.projectedDelay)).toBe(true);
  });
});

describe('sla ladder', () => {
  it('walks T-2d to systemic', () => {
    const t = { sla: 14, st: 'Open' };
    expect(slaState(t, 0).label).toContain('SLA');
    expect(slaState(t, 14).label).toContain('DUE');
    expect(slaState(t, 17).label).toContain('OVERDUE');
    expect(slaState(t, 21).label).toContain('SYSTEMIC');
    expect(slaState({ ...t, st: 'Closed' }, 99).label).toBe('Closed');
  });
  it('isDue only on DUE/OVERDUE', () => {
    expect(isDue({ sla: 14, st: 'Open' }, 14)).toBe(true);
    expect(isDue({ sla: 14, st: 'Open' }, 0)).toBe(false);
    expect(isDue({ sla: 14, st: 'Closed' }, 14)).toBe(false);
  });
});

describe('hash chain', () => {
  it('chains and verifies', () => {
    const h1 = chainHash('0', 'Login', '1');
    const h2 = chainHash(h1, 'Approved', '2');
    expect(verifyChain([
      { prev: '0', hash: h1 },
      { prev: h1, hash: h2 },
    ])).toBe(true);
  });
  it('rejects broken links and bad input', () => {
    expect(verifyChain([{ prev: 'X', hash: 'y' }])).toBe(false);
    expect(verifyChain('nope')).toBe(false);
  });
});

describe('portfolioStats', () => {
  it('aggregates counts', () => {
    const s = portfolioStats([
      { ...base, over: 0, phys: 50, fin: 50 },
      { ...base, over: 60, phys: 90, fin: 40, photo: 0, flagged: true },
    ]);
    expect(s.total).toBe(2);
    expect(s.critical + s.atRisk + s.onTrack).toBe(2);
    expect(s.avgHealth).toBeGreaterThan(0);
  });
});
