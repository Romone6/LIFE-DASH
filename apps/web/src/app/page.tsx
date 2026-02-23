"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TwinCanvas from "../components/TwinCanvas";
import TerrainCanvas from "../components/TerrainCanvas";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type PlanRow = {
  id: string;
  mode: string;
  audit_status: string | null;
  plan_json: any;
};

type CalendarItem = { id: string; summary: string };

export default function DashboardPage() {
  const [userId, setUserId] = useState("");
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [status, setStatus] = useState("Idle");
  const [mode, setMode] = useState("A");
  const [audit, setAudit] = useState<any>(null);
  const [governor, setGovernor] = useState<any>(null);
  const [capital, setCapital] = useState<any>(null);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [calendarStatus, setCalendarStatus] = useState<any>(null);
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>("");
  const [evidence, setEvidence] = useState<any[]>([]);

  const [incomeTitle, setIncomeTitle] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const dateLocal = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const fetchPlans = useCallback(async () => {
    if (!userId) return;
    setStatus("Refreshing...");
    const res = await fetch(`${API_BASE}/v1/plans/${dateLocal}?mode=${mode}`, {
      headers: { "x-user-id": userId }
    });
    if (!res.ok) {
      setStatus("Failed to fetch");
      return;
    }
    const data = await res.json();
    setPlans(data.plans ?? []);
    setStatus("Live");

    const current = (data.plans ?? [])[0];
    if (current?.id) {
      fetch(`${API_BASE}/v1/audit/${current.id}`, { headers: { "x-user-id": userId } })
        .then((r) => (r.ok ? r.json() : null))
        .then((payload) => setAudit(payload?.audit ?? null))
        .catch(() => setAudit(null));

      fetch(`${API_BASE}/v1/calendar/${current.id}/status`, { headers: { "x-user-id": userId } })
        .then((r) => (r.ok ? r.json() : null))
        .then((payload) => setCalendarStatus(payload?.status ?? null))
        .catch(() => setCalendarStatus(null));
    }

    fetch(`${API_BASE}/v1/governor/state`, { headers: { "x-user-id": userId } })
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => setGovernor(payload?.state ?? null))
      .catch(() => setGovernor(null));

    fetch(`${API_BASE}/v1/experiments`, { headers: { "x-user-id": userId } })
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => setExperiments(payload?.experiments ?? []))
      .catch(() => setExperiments([]));

    fetch(`${API_BASE}/v1/capital/simulation`, { headers: { "x-user-id": userId } })
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => setCapital(payload?.simulation ?? null))
      .catch(() => setCapital(null));

    fetch(`${API_BASE}/v1/evidence`, { headers: { "x-user-id": userId } })
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => setEvidence(payload?.evidence ?? []))
      .catch(() => setEvidence([]));
  }, [dateLocal, mode, userId]);

  useEffect(() => {
    const id = setInterval(fetchPlans, 30000);
    fetchPlans();
    return () => clearInterval(id);
  }, [fetchPlans]);

  const active = plans[0];

  const regeneratePlan = async () => {
    if (!userId) return;
    setStatus("Regenerating...");
    await fetch(`${API_BASE}/v1/plans/${dateLocal}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
    });
    fetchPlans();
  };

  const runAudit = async () => {
    if (!userId || !active?.id) return;
    setStatus("Auditing...");
    await fetch(`${API_BASE}/v1/audit/${active.id}/run`, {
      method: "POST",
      headers: { "x-user-id": userId }
    });
    fetchPlans();
  };

  const syncCalendar = async () => {
    if (!userId || !active?.id) return;
    setStatus("Syncing calendar...");
    await fetch(`${API_BASE}/v1/calendar/${active.id}/sync`, {
      method: "POST",
      headers: { "x-user-id": userId }
    });
    fetchPlans();
  };

  const switchMode = async (next: string) => {
    setMode(next);
    if (!userId) return;
    await fetch(`${API_BASE}/v1/plans/${dateLocal}/mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ mode: next })
    });
    fetchPlans();
  };

  const fetchCalendars = async () => {
    if (!userId) return;
    const res = await fetch(`${API_BASE}/v1/calendar/list`, { headers: { "x-user-id": userId } });
    if (!res.ok) return;
    const data = await res.json();
    const items = (data.items ?? []).map((item: any) => ({ id: item.id, summary: item.summary }));
    setCalendars(items);
  };

  const selectCalendar = async () => {
    if (!userId || !selectedCalendar) return;
    await fetch(`${API_BASE}/v1/calendar/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ calendar_id: selectedCalendar })
    });
  };

  const approveExperiment = async (id: string) => {
    if (!userId) return;
    await fetch(`${API_BASE}/v1/experiments/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ experiment_id: id })
    });
    fetchPlans();
  };

  const abortExperiment = async (id: string) => {
    if (!userId) return;
    await fetch(`${API_BASE}/v1/experiments/abort`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({ experiment_id: id })
    });
    fetchPlans();
  };

  const addIncome = async () => {
    if (!userId) return;
    await fetch(`${API_BASE}/v1/capital/income`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({
        source_id: crypto.randomUUID(),
        title: incomeTitle,
        amount_monthly: Number(incomeAmount || 0),
        stability_score: 1,
        volatility_flag: false
      })
    });
    setIncomeTitle("");
    setIncomeAmount("");
    fetchPlans();
  };

  const addExpense = async () => {
    if (!userId) return;
    await fetch(`${API_BASE}/v1/capital/expense`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": userId },
      body: JSON.stringify({
        expense_id: crypto.randomUUID(),
        category: expenseCategory,
        amount_monthly: Number(expenseAmount || 0),
        fixed_flag: true
      })
    });
    setExpenseCategory("");
    setExpenseAmount("");
    fetchPlans();
  };

  const evidenceById = new Map(evidence.map((e) => [e.id, e]));

  return (
    <div className="lab-root">
      <div className="mesh" />
      <header className="lab-header">
        <div>
          <div className="lab-title">LifeOS AI Lab Console</div>
          <div className="lab-subtitle">Strategic Command Interface</div>
        </div>
        <div className="lab-status">
          <span className="status-dot" />
          {status}
        </div>
      </header>

      <section className="lab-controls">
        <div className="control">
          <label>User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="uuid"
          />
        </div>
        <div className="control">
          <label>Plan Mode</label>
          <div className="mode-toggle">
            {"ABC".split("").map((m) => (
              <button
                key={m}
                className={m === mode ? "active" : ""}
                onClick={() => switchMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="control">
          <label>Actions</label>
          <div className="action-row">
            <button onClick={fetchPlans}>Refresh</button>
            <button onClick={regeneratePlan}>Regenerate</button>
            <button onClick={runAudit}>Run Audit</button>
            <button onClick={syncCalendar}>Sync Calendar</button>
          </div>
        </div>
      </section>

      <main className="lab-grid">
        <aside className="panel left">
          <div className="panel-title">System Controls</div>
          <div className="panel-block">Calendar Sync: {active?.plan_json ? "Ready" : "--"}</div>
          <div className="panel-block">Audit Status: {active?.audit_status ?? "--"}</div>
          <div className="panel-block">Governor Zone: {governor?.zone ?? "--"}</div>
          <div className="panel-title">Capital Simulation</div>
          <div className="panel-block">Runway: {capital?.runwayMonths?.toFixed?.(1) ?? "--"} months</div>
          <div className="panel-block">Surplus: {capital?.surplus ?? "--"}</div>
          <div className="panel-block input-grid">
            <input
              placeholder="Income title"
              value={incomeTitle}
              onChange={(e) => setIncomeTitle(e.target.value)}
            />
            <input
              placeholder="Amount"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
            />
            <button onClick={addIncome}>Add Income</button>
          </div>
          <div className="panel-block input-grid">
            <input
              placeholder="Expense category"
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
            />
            <input
              placeholder="Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
            />
            <button onClick={addExpense}>Add Expense</button>
          </div>
          <div className="panel-title">Calendar Selection</div>
          <div className="panel-block">
            <button onClick={fetchCalendars}>List Calendars</button>
            <select
              value={selectedCalendar}
              onChange={(e) => setSelectedCalendar(e.target.value)}
            >
              <option value="">Select calendar</option>
              {calendars.map((c) => (
                <option key={c.id} value={c.id}>{c.summary}</option>
              ))}
            </select>
            <button onClick={selectCalendar}>Use Calendar</button>
          </div>
          <div className="panel-block">AI Run Metadata</div>
          <div className="panel-mono">Prompt: planner-v1</div>
        </aside>

        <section className="panel center">
          <div className="panel-title">Timeline Energy Stream</div>
          <div className="timeline">
            {(active?.plan_json?.blocks ?? []).map((block: any) => (
              <div key={block.block_id} className="block-card">
                <div className="block-title">{block.title}</div>
                <div className="block-meta">{block.type}</div>
                <div className="block-meta">
                  Confidence: {block.confidence_level ?? "LOW"}{" "}
                  {block.evidence_refs?.length ? "• Evidence" : ""}
                </div>
                <div className="block-time">
                  {block.start_at} → {block.end_at}
                </div>
                {block.evidence_refs?.length ? (
                  <div className="evidence-list">
                    {block.evidence_refs.map((id: string) => (
                      <div key={id} className="evidence-card">
                        <div>{evidenceById.get(id)?.title ?? id}</div>
                        <div className="block-meta">{evidenceById.get(id)?.study_type ?? ""}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {!active && <div className="empty">No plan loaded</div>}
          </div>
        </section>

        <aside className="panel right">
          <div className="panel-title">Risk Register</div>
          <div className="risk-ring">
            <div className="ring" />
            <div className="ring-label">Stability</div>
          </div>
          <div className="panel-title">Digital Twin</div>
          <TwinCanvas />
          <div className="panel-title">Goal Terrain</div>
          <TerrainCanvas />
          <div className="panel-title">Audit Viewer</div>
          <div className="panel-block">Warnings: {audit?.warnings?.length ?? 0}</div>
          <div className="panel-title">Experiments</div>
          <div className="panel-block">
            Active: {experiments.filter((e) => e.status === "ACTIVE").length}
          </div>
          {experiments.filter((e) => e.status === "PROPOSED").map((exp) => (
            <div key={exp.id} className="panel-block">
              <div>{exp.hypothesis}</div>
              <button onClick={() => approveExperiment(exp.id)}>Approve</button>
            </div>
          ))}
          {experiments.filter((e) => e.status === "ACTIVE").map((exp) => (
            <div key={exp.id} className="panel-block">
              <div>{exp.hypothesis}</div>
              <button onClick={() => abortExperiment(exp.id)}>Abort</button>
            </div>
          ))}
          <div className="panel-title">Calendar Sync</div>
          <div className="panel-block">Last sync: {calendarStatus?.last_sync_at ?? "--"}</div>
        </aside>
      </main>
    </div>
  );
}
