"use client";

import { useEffect, useMemo, useState } from "react";
import TwinCanvas from "../components/TwinCanvas";
import TerrainCanvas from "../components/TerrainCanvas";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

type PlanRow = {
  id: string;
  mode: string;
  audit_status: string | null;
  plan_json: any;
};

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

  const dateLocal = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const fetchPlans = async () => {
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
  };

  useEffect(() => {
    const id = setInterval(fetchPlans, 30000);
    fetchPlans();
    return () => clearInterval(id);
  }, [userId, mode]);

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
          <div className="panel-title">Calendar Sync</div>
          <div className="panel-block">Last sync: {calendarStatus?.last_sync_at ?? "--"}</div>
        </aside>
      </main>
    </div>
  );
}
