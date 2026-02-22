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
  };

  useEffect(() => {
    const id = setInterval(fetchPlans, 30000);
    fetchPlans();
    return () => clearInterval(id);
  }, [userId, mode]);

  const active = plans[0];

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
                onClick={() => setMode(m)}
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
          </div>
        </div>
      </section>

      <main className="lab-grid">
        <aside className="panel left">
          <div className="panel-title">System Controls</div>
          <div className="panel-block">Calendar Sync: {active?.plan_json ? "Ready" : "--"}</div>
          <div className="panel-block">Audit Status: {active?.audit_status ?? "--"}</div>
          <div className="panel-title">Capital Simulation</div>
          <div className="panel-block">Runway: --</div>
          <div className="panel-block">Surplus: --</div>
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
          <div className="panel-block">Warnings: --</div>
          <div className="panel-title">Experiments</div>
          <div className="panel-block">Active: --</div>
          <div className="panel-title">Calendar Sync</div>
          <div className="panel-block">Last sync: --</div>
        </aside>
      </main>
    </div>
  );
}
