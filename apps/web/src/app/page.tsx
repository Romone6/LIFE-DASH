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
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardStatus, setWizardStatus] = useState("Idle");
  const [wizardErrors, setWizardErrors] = useState<Record<string, string>>({});
  const [wizardMode, setWizardMode] = useState("A");
  const [wizardGenerated, setWizardGenerated] = useState(false);
  const [wizardPreview, setWizardPreview] = useState<PlanRow | null>(null);
  const [nonNegotiableInput, setNonNegotiableInput] = useState("");
  const [wizardData, setWizardData] = useState({
    profile: {
      sleep_window: { start: "23:00", end: "07:00", hard_flag: true },
      preferences: { aggression_level: 0.6, deep_work_preference: "morning", meal_count: 3 },
      non_negotiables: [] as string[]
    },
    goals: [
      {
        id: crypto.randomUUID(),
        title: "",
        priority_weight: 0.8,
        deadline_date: "",
        success_metric: ""
      }
    ],
    commitments: [] as {
      id: string;
      title: string;
      start_at: string;
      end_at: string;
      recurrence_rule: string;
      hard_flag: boolean;
    }[]
  });

  const dateLocal = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    const storedUser = localStorage.getItem("lifeos_user_id");
    const done = localStorage.getItem("lifeos_wizard_complete");
    if (storedUser && !userId) {
      setUserId(storedUser);
    }
    if (!done) {
      setWizardOpen(true);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      localStorage.setItem("lifeos_user_id", userId);
    }
  }, [userId]);

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

  const validateProfile = () => {
    const errors: Record<string, string> = {};
    if (!userId) errors.userId = "User ID is required.";
    if (!wizardData.profile.sleep_window.start) errors.sleepStart = "Start time required.";
    if (!wizardData.profile.sleep_window.end) errors.sleepEnd = "End time required.";
    if (!wizardData.profile.preferences.meal_count) errors.mealCount = "Meal count required.";
    return errors;
  };

  const validateGoals = () => {
    const errors: Record<string, string> = {};
    const completeGoals = wizardData.goals.filter(
      (goal) => goal.title && goal.deadline_date && goal.success_metric
    );
    if (completeGoals.length === 0) {
      errors.goals = "Add at least one complete goal.";
    }
    return errors;
  };

  const validateCommitments = () => {
    const errors: Record<string, string> = {};
    const hasPartial = wizardData.commitments.some(
      (c) => (c.title || c.start_at || c.end_at || c.recurrence_rule) && !(c.title && c.start_at && c.end_at)
    );
    if (hasPartial) {
      errors.commitments = "Each commitment requires title, start, and end.";
    }
    return errors;
  };

  const loadPreview = useCallback(
    async (nextMode: string) => {
      if (!userId) return;
      const res = await fetch(`${API_BASE}/v1/plans/${dateLocal}?mode=${nextMode}`, {
        headers: { "x-user-id": userId }
      });
      if (!res.ok) return;
      const data = await res.json();
      setWizardPreview((data.plans ?? [])[0] ?? null);
    },
    [dateLocal, userId]
  );

  const nextWizardStep = async () => {
    let errors: Record<string, string> = {};
    if (wizardStep === 0) errors = validateProfile();
    if (wizardStep === 1) errors = validateGoals();
    if (wizardStep === 2) errors = validateCommitments();
    setWizardErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setWizardStep((step) => Math.min(step + 1, 3));
  };

  const prevWizardStep = () => {
    setWizardStep((step) => Math.max(step - 1, 0));
    setWizardGenerated(false);
    setWizardPreview(null);
    setWizardStatus("Idle");
  };

  const generateWizardPlan = async () => {
    if (!userId) return;
    setWizardStatus("Saving...");
    setWizardErrors({});
    const cleanedGoals = wizardData.goals
      .filter((goal) => goal.title && goal.deadline_date && goal.success_metric)
      .map((goal) => ({
        ...goal,
        priority_weight: Number(goal.priority_weight)
      }));
    const cleanedCommitments = wizardData.commitments
      .filter((c) => c.title && c.start_at && c.end_at)
      .map((c) => ({
        ...c,
        start_at: new Date(c.start_at).toISOString(),
        end_at: new Date(c.end_at).toISOString()
      }));

    const profileRes = await fetch(`${API_BASE}/v1/profile/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({
        profile: wizardData.profile,
        goals: cleanedGoals,
        commitments: cleanedCommitments
      })
    });

    if (!profileRes.ok) {
      setWizardStatus("Error");
      setWizardErrors({ api: "Failed to save profile data." });
      return;
    }

    setWizardStatus("Generating...");
    const planRes = await fetch(`${API_BASE}/v1/plans/${dateLocal}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId
      },
      body: JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })
    });

    if (!planRes.ok) {
      setWizardStatus("Error");
      setWizardErrors({ api: "Plan generation failed. Try again." });
      return;
    }

    setWizardGenerated(true);
    setWizardStatus("Preview ready");
    await loadPreview(wizardMode);
  };

  const completeWizard = () => {
    localStorage.setItem("lifeos_wizard_complete", "true");
    setWizardOpen(false);
    setWizardGenerated(false);
    setWizardStep(0);
    setMode(wizardMode);
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
        <div className="lab-header-actions">
          <div className="lab-status">
            <span className="status-dot" />
            {status}
          </div>
          <button className="ghost" onClick={() => setWizardOpen(true)}>Setup Wizard</button>
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

      {wizardOpen && (
        <div className="wizard-overlay">
          <div className="wizard-card">
            <div className="wizard-header">
              <div>
                <div className="wizard-title">System Initialization Wizard</div>
                <div className="wizard-subtitle">Create your first profile and plan</div>
              </div>
              <div className="wizard-stepper">Step {wizardStep + 1} / 4</div>
            </div>

            <div className="wizard-body">
              {wizardStep === 0 && (
                <div className="wizard-grid">
                  <div className="wizard-field">
                    <label>User ID</label>
                    <div className="wizard-inline">
                      <input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="uuid"
                      />
                      <button onClick={() => setUserId(crypto.randomUUID())}>Generate</button>
                    </div>
                    {wizardErrors.userId && <div className="wizard-error">{wizardErrors.userId}</div>}
                  </div>
                  <div className="wizard-field">
                    <label>Sleep Window</label>
                    <div className="wizard-inline">
                      <input
                        type="time"
                        value={wizardData.profile.sleep_window.start}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            profile: {
                              ...prev.profile,
                              sleep_window: { ...prev.profile.sleep_window, start: e.target.value }
                            }
                          }))
                        }
                      />
                      <input
                        type="time"
                        value={wizardData.profile.sleep_window.end}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            profile: {
                              ...prev.profile,
                              sleep_window: { ...prev.profile.sleep_window, end: e.target.value }
                            }
                          }))
                        }
                      />
                    </div>
                    {(wizardErrors.sleepStart || wizardErrors.sleepEnd) && (
                      <div className="wizard-error">Sleep window required.</div>
                    )}
                  </div>
                  <div className="wizard-field">
                    <label>Aggression Level</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={wizardData.profile.preferences.aggression_level}
                      onChange={(e) =>
                        setWizardData((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            preferences: {
                              ...prev.profile.preferences,
                              aggression_level: Number(e.target.value)
                            }
                          }
                        }))
                      }
                    />
                  </div>
                  <div className="wizard-field">
                    <label>Deep Work Preference</label>
                    <select
                      value={wizardData.profile.preferences.deep_work_preference}
                      onChange={(e) =>
                        setWizardData((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            preferences: {
                              ...prev.profile.preferences,
                              deep_work_preference: e.target.value
                            }
                          }
                        }))
                      }
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                  <div className="wizard-field">
                    <label>Meal Count</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={wizardData.profile.preferences.meal_count}
                      onChange={(e) =>
                        setWizardData((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            preferences: {
                              ...prev.profile.preferences,
                              meal_count: Number(e.target.value)
                            }
                          }
                        }))
                      }
                    />
                    {wizardErrors.mealCount && <div className="wizard-error">{wizardErrors.mealCount}</div>}
                  </div>
                  <div className="wizard-field">
                    <label>Non-negotiables</label>
                    <div className="wizard-inline">
                      <input
                        value={nonNegotiableInput}
                        onChange={(e) => setNonNegotiableInput(e.target.value)}
                        placeholder="Gym, family dinner..."
                      />
                      <button
                        onClick={() => {
                          if (!nonNegotiableInput.trim()) return;
                          setWizardData((prev) => ({
                            ...prev,
                            profile: {
                              ...prev.profile,
                              non_negotiables: [
                                ...prev.profile.non_negotiables,
                                nonNegotiableInput.trim()
                              ]
                            }
                          }));
                          setNonNegotiableInput("");
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <div className="chip-row">
                      {wizardData.profile.non_negotiables.map((item) => (
                        <button
                          key={item}
                          className="chip"
                          onClick={() =>
                            setWizardData((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                non_negotiables: prev.profile.non_negotiables.filter((n) => n !== item)
                              }
                            }))
                          }
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 1 && (
                <div className="wizard-list">
                  <div className="wizard-list-header">
                    <div className="wizard-label">Goals</div>
                    <button
                      onClick={() =>
                        setWizardData((prev) => ({
                          ...prev,
                          goals: [
                            ...prev.goals,
                            {
                              id: crypto.randomUUID(),
                              title: "",
                              priority_weight: 0.8,
                              deadline_date: "",
                              success_metric: ""
                            }
                          ]
                        }))
                      }
                    >
                      + Add Goal
                    </button>
                  </div>
                  {wizardErrors.goals && <div className="wizard-error">{wizardErrors.goals}</div>}
                  {wizardData.goals.map((goal, idx) => (
                    <div key={goal.id} className="wizard-row">
                      <input
                        placeholder="Goal title"
                        value={goal.title}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            goals: prev.goals.map((item, i) =>
                              i === idx ? { ...item, title: e.target.value } : item
                            )
                          }))
                        }
                      />
                      <input
                        type="date"
                        value={goal.deadline_date}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            goals: prev.goals.map((item, i) =>
                              i === idx ? { ...item, deadline_date: e.target.value } : item
                            )
                          }))
                        }
                      />
                      <input
                        placeholder="Success metric"
                        value={goal.success_metric}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            goals: prev.goals.map((item, i) =>
                              i === idx ? { ...item, success_metric: e.target.value } : item
                            )
                          }))
                        }
                      />
                      <div className="wizard-inline">
                        <label>Priority</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={goal.priority_weight}
                          onChange={(e) =>
                            setWizardData((prev) => ({
                              ...prev,
                              goals: prev.goals.map((item, i) =>
                                i === idx
                                  ? { ...item, priority_weight: Number(e.target.value) }
                                  : item
                              )
                            }))
                          }
                        />
                      </div>
                      <button
                        className="ghost"
                        onClick={() =>
                          setWizardData((prev) => ({
                            ...prev,
                            goals: prev.goals.filter((_, i) => i !== idx)
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {wizardStep === 2 && (
                <div className="wizard-list">
                  <div className="wizard-list-header">
                    <div className="wizard-label">Commitments</div>
                    <button
                      onClick={() =>
                        setWizardData((prev) => ({
                          ...prev,
                          commitments: [
                            ...prev.commitments,
                            {
                              id: crypto.randomUUID(),
                              title: "",
                              start_at: "",
                              end_at: "",
                              recurrence_rule: "",
                              hard_flag: true
                            }
                          ]
                        }))
                      }
                    >
                      + Add Commitment
                    </button>
                  </div>
                  {wizardErrors.commitments && (
                    <div className="wizard-error">{wizardErrors.commitments}</div>
                  )}
                  {wizardData.commitments.length === 0 && (
                    <div className="wizard-muted">No commitments added.</div>
                  )}
                  {wizardData.commitments.map((commitment, idx) => (
                    <div key={commitment.id} className="wizard-row">
                      <input
                        placeholder="Commitment title"
                        value={commitment.title}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            commitments: prev.commitments.map((item, i) =>
                              i === idx ? { ...item, title: e.target.value } : item
                            )
                          }))
                        }
                      />
                      <input
                        type="datetime-local"
                        value={commitment.start_at}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            commitments: prev.commitments.map((item, i) =>
                              i === idx ? { ...item, start_at: e.target.value } : item
                            )
                          }))
                        }
                      />
                      <input
                        type="datetime-local"
                        value={commitment.end_at}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            commitments: prev.commitments.map((item, i) =>
                              i === idx ? { ...item, end_at: e.target.value } : item
                            )
                          }))
                        }
                      />
                      <input
                        placeholder="RRULE"
                        value={commitment.recurrence_rule}
                        onChange={(e) =>
                          setWizardData((prev) => ({
                            ...prev,
                            commitments: prev.commitments.map((item, i) =>
                              i === idx ? { ...item, recurrence_rule: e.target.value } : item
                            )
                          }))
                        }
                      />
                      <label className="wizard-checkbox">
                        <input
                          type="checkbox"
                          checked={commitment.hard_flag}
                          onChange={(e) =>
                            setWizardData((prev) => ({
                              ...prev,
                              commitments: prev.commitments.map((item, i) =>
                                i === idx ? { ...item, hard_flag: e.target.checked } : item
                              )
                            }))
                          }
                        />
                        Hard
                      </label>
                      <button
                        className="ghost"
                        onClick={() =>
                          setWizardData((prev) => ({
                            ...prev,
                            commitments: prev.commitments.filter((_, i) => i !== idx)
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {wizardStep === 3 && (
                <div className="wizard-preview">
                  <div className="wizard-preview-header">
                    <div className="wizard-label">Plan Preview</div>
                    <div className="wizard-mode-toggle">
                      {"ABC".split("").map((m) => (
                        <button
                          key={m}
                          className={m === wizardMode ? "active" : ""}
                          onClick={() => {
                            setWizardMode(m);
                            loadPreview(m);
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  {wizardErrors.api && <div className="wizard-error">{wizardErrors.api}</div>}
                  {!wizardGenerated && (
                    <div className="wizard-muted">
                      Generate a plan to preview blocks before activation.
                    </div>
                  )}
                  {wizardPreview && (
                    <div className="wizard-preview-list">
                      {(wizardPreview.plan_json?.blocks ?? []).map((block: any) => (
                        <div key={block.block_id} className="block-card">
                          <div className="block-title">{block.title}</div>
                          <div className="block-meta">{block.type}</div>
                          <div className="block-time">
                            {block.start_at} → {block.end_at}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="wizard-footer">
              <div className="wizard-status">{wizardStatus}</div>
              <div className="wizard-actions">
                {wizardStep > 0 && <button onClick={prevWizardStep}>Back</button>}
                {wizardStep < 3 && <button onClick={nextWizardStep}>Next</button>}
                {wizardStep === 3 && (
                  <>
                    <button onClick={generateWizardPlan}>Generate</button>
                    {wizardGenerated && (
                      <button className="active" onClick={completeWizard}>
                        Activate & Enter Console
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
