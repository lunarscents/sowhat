import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  TabStrip,
  TabStripTab
} from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Field, Form, FormElement, type FieldRenderProps } from "@progress/kendo-react-form";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { ProgressBar } from "@progress/kendo-react-progressbars";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import {
  Chart,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartSeries,
  ChartSeriesItem,
  ChartTitle
} from "@progress/kendo-react-charts";
import {
  Notification,
  NotificationGroup
} from "@progress/kendo-react-notification";
import { evidenceSources, monsters } from "./data";
import {
  convertEvidenceToLoot,
  emptyGameState,
  generateBossResult,
  getMonsterHp,
  isBossUnlocked
} from "./gameLogic";
import { clearGameState, loadGameState, saveGameState } from "./storage";
import type { Evidence, EvidenceSource, GameState, Loot, Monster } from "./types";

type Toast = {
  id: string;
  type: "success" | "info";
  message: string;
};

type EvidenceFormValues = {
  source?: EvidenceSource;
  claim?: string;
  proof?: string;
  practicalUse?: string;
};

const required = (value: unknown) => (value ? "" : "Required");

const sourceQuestions: Record<EvidenceSource, string> = {
  "Session": "What claim did the speaker make, and what evidence supported it?",
  "Q&A": "What limitation, trade-off, or practical concern did this question reveal?",
  "Sponsor Booth": "What real user problem does this tool solve best, and when is it not a good fit?",
  "Hallway Conversation": "What did another attendee notice that you missed?",
  "Reflection": "What next action would make this idea useful for your team this week?"
};

const sourceLabels: Record<EvidenceSource, string> = {
  "Session": "Session",
  "Q&A": "Q&A",
  "Sponsor Booth": "Sponsor",
  "Hallway Conversation": "Hallway",
  "Reflection": "Reflection"
};

const FieldInput = (props: FieldRenderProps) => {
  const { validationMessage, label, visited, touched, modified, children, ...inputProps } = props;

  return (
    <label className="field">
      <span>{label}</span>
      <Input {...inputProps} valid={!validationMessage} />
      {validationMessage && <small>{validationMessage}</small>}
    </label>
  );
};

const FieldTextArea = (props: FieldRenderProps) => {
  const {
    validationMessage,
    label,
    visited,
    touched,
    modified,
    children,
    rows,
    ...inputProps
  } = props;

  return (
    <label className="field">
      <span>{label}</span>
      <TextArea {...inputProps} rows={rows || 3} valid={!validationMessage} />
      {validationMessage && <small>{validationMessage}</small>}
    </label>
  );
};

const FieldSource = (props: FieldRenderProps) => (
  <label className="field">
    <span>{props.label}</span>
    <DropDownList
      data={evidenceSources}
      value={props.value}
      onChange={(event) => props.onChange({ value: event.value })}
      valid={!props.validationMessage}
    />
    {props.validationMessage && <small>{props.validationMessage}</small>}
  </label>
);

const getSuggestedQuestion = (
  source: EvidenceSource | undefined,
  monster: Monster
) => {
  return `${sourceQuestions[source || "Session"]} For ${monster.name}, listen for ${monster.weakness.toLowerCase()}.`;
};

function App() {
  const [state, setState] = useState<GameState>(() => loadGameState());
  const [activeTab, setActiveTab] = useState(0);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [bossOpen, setBossOpen] = useState(false);
  const [preferredSource, setPreferredSource] = useState<EvidenceSource>("Session");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const selectedMonster = monsters.find(
    (monster) => monster.id === state.selectedMonsterId
  );

  const selectedHp = selectedMonster
    ? getMonsterHp(state, selectedMonster.id)
    : null;

  const dashboard = useMemo(() => buildDashboard(state), [state]);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const notify = (message: string, type: Toast["type"] = "success") => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3200);
  };

  const selectMonster = (monster: Monster) => {
    setState((current) => ({
      ...current,
      selectedMonsterId: monster.id,
      bossResult: null
    }));
    setActiveTab(1);
  };

  const openEvidence = (source: EvidenceSource = preferredSource) => {
    if (!selectedMonster) {
      notify("Pick a monster first, then collect evidence.", "info");
      setActiveTab(0);
      return;
    }

    setPreferredSource(source);
    setEvidenceOpen(true);
  };

  const addEvidence = (values: EvidenceFormValues) => {
    if (!selectedMonster || !values.source || !values.claim || !values.proof) return;

    const evidence: Evidence = {
      id: crypto.randomUUID(),
      monsterId: selectedMonster.id,
      source: values.source,
      claim: values.claim,
      proof: values.proof,
      practicalUse: values.practicalUse || "Use this as a practical discussion prompt.",
      createdAt: new Date().toISOString()
    };
    const loot = convertEvidenceToLoot(evidence);

    setState((current) => ({
      ...current,
      evidence: [evidence, ...current.evidence],
      loot: [loot, ...current.loot]
    }));
    setEvidenceOpen(false);
    notify(`Loot gained: ${loot.name}`);
  };

  const defeatBoss = () => {
    const result = generateBossResult(state);
    setState((current) => ({ ...current, bossResult: result }));
    setBossOpen(false);
    setActiveTab(2);
    notify("Boss defeated: insight and next action generated.");
  };

  const copyTeamSummary = async () => {
    if (!state.bossResult) return;

    try {
      await navigator.clipboard.writeText(state.bossResult.shareSummary);
      notify("Team share summary copied.", "info");
    } catch {
      notify("Copy failed. Select the summary text manually.", "info");
    }
  };

  const copySuggestedQuestion = async (source: EvidenceSource | undefined) => {
    if (!selectedMonster) return;

    try {
      await navigator.clipboard.writeText(getSuggestedQuestion(source, selectedMonster));
      notify("Suggested question copied.", "info");
    } catch {
      notify("Copy failed. Select the question text manually.", "info");
    }
  };

  const resetDemo = () => {
    clearGameState();
    setState(emptyGameState);
    setActiveTab(0);
    notify("Demo reset.", "info");
  };

  const loadDemoData = () => {
    const loadedAt = new Date().toISOString();
    const monsterId = "ai-hype-hydra";
    const demoEvidence: Evidence[] = [
      {
        id: "demo-evidence-trust-loop",
        monsterId,
        source: "Q&A",
        evidenceType: "Limitation",
        claim: "People asked how to trust AI agents during large-scale refactoring without losing control.",
        proof: "The Q&A kept returning to control, review, and confidence during high-risk code changes.",
        practicalUse: "Create a trust loop that keeps humans in review before agent changes land.",
        createdAt: loadedAt
      },
      {
        id: "demo-evidence-guardrails",
        monsterId,
        source: "Session",
        evidenceType: "Human factor",
        claim: "The speaker emphasized that AI agents need orchestration, guardrails, review loops, and clear ownership.",
        proof: "The session framed agent success as an operating model problem, not just a model capability problem.",
        practicalUse: "Document guardrails and ownership before letting an agent touch shared refactoring work.",
        createdAt: loadedAt
      },
      {
        id: "demo-evidence-review-rune",
        monsterId,
        source: "Reflection",
        evidenceType: "Next action",
        claim: "I want to try a small AI-assisted refactoring experiment with explicit human review checkpoints.",
        proof: "A narrow experiment can test value without betting the codebase on broad agent autonomy.",
        practicalUse: "Run a small AI-assisted refactoring pilot with explicit human review checkpoints.",
        createdAt: loadedAt
      }
    ];
    const demoLoot: Loot[] = [
      {
        id: "demo-loot-trust-loop",
        monsterId,
        name: "Trust Loop Crystal",
        type: "Limitation",
        source: "Q&A",
        value: "A control loop for trusting AI-assisted refactoring without losing human oversight.",
        damage: 30,
        createdAt: loadedAt
      },
      {
        id: "demo-loot-guardrail",
        monsterId,
        name: "Guardrail Shard",
        type: "Human factor",
        source: "Session",
        value: "Guardrails, orchestration, review loops, and ownership before agent autonomy.",
        damage: 30,
        createdAt: loadedAt
      },
      {
        id: "demo-loot-human-review",
        monsterId,
        name: "Human Review Rune",
        type: "Next action",
        source: "Reflection",
        value: "A small AI-assisted refactoring pilot with explicit human review checkpoints.",
        damage: 30,
        createdAt: loadedAt
      }
    ];

    setState({
      selectedMonsterId: monsterId,
      evidence: demoEvidence,
      loot: demoLoot,
      bossResult: null
    });
    setEvidenceOpen(false);
    setBossOpen(false);
    setActiveTab(1);
    notify("Demo data loaded: AI Hype Hydra is ready for the final boss.", "info");
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <p className="eyebrow">Conference game</p>
          <h1>
            So What<span>?!</span>
          </h1>
          <p className="tagline">Turn conference ideas into evidence-driven action</p>
        </div>
        <div className="topbar-actions">
          <Button themeColor="secondary" onClick={loadDemoData}>
            Load Demo Data
          </Button>
          <Button themeColor="base" onClick={resetDemo}>
            Reset Demo
          </Button>
          <Button
            themeColor="primary"
            disabled={!selectedMonster}
            onClick={() => openEvidence()}
          >
            Add evidence
          </Button>
        </div>
      </header>

      <section className="demo-path" aria-label="Demo path">
        <span>2-minute judge demo</span>
        <strong>Load demo data, defeat the boss, show organizer signals.</strong>
      </section>

      <section className="impact-strip" aria-label="Hackathon impact">
        <div>
          <span>Better Content</span>
          <strong>Attendees discover better content by hunting for evidence.</strong>
        </div>
        <div>
          <span>Smarter Interactions</span>
          <strong>Attendees have smarter interactions through suggested questions.</strong>
        </div>
        <div>
          <span>Organizer Scale</span>
          <strong>Organizers get scalable engagement signals from collected evidence.</strong>
        </div>
      </section>

      <section className="status-strip">
        <div>
          <span>Monster</span>
          <strong>{selectedMonster?.name || "Pick one"}</strong>
        </div>
        <div>
          <span>Loot</span>
          <strong>{state.loot.length}/3</strong>
        </div>
        <div className={isBossUnlocked(state) ? "status-ready" : ""}>
          <span>Boss</span>
          <strong>{isBossUnlocked(state) ? "Unlocked" : "Locked"}</strong>
        </div>
      </section>

      <section className="interaction-coach" aria-label="Interaction prompts">
        <div className="coach-copy">
          <span>Interaction Coach</span>
          <strong>Pick a source prompt before the conversation starts.</strong>
          <p>
            These prompts turn passive listening into better questions for sessions,
            sponsors, and hallway conversations.
          </p>
        </div>
        <div className="prompt-grid">
          {(["Session", "Q&A", "Sponsor Booth", "Hallway Conversation"] as EvidenceSource[]).map(
            (source) => (
              <button
                className={`prompt-card ${preferredSource === source ? "active" : ""}`}
                key={source}
                type="button"
                onClick={() => openEvidence(source)}
              >
                <span>{sourceLabels[source]}</span>
                <strong>{sourceQuestions[source]}</strong>
              </button>
            )
          )}
        </div>
      </section>

      <TabStrip selected={activeTab} onSelect={(event) => setActiveTab(event.selected)}>
        <TabStripTab title="Hunt">
          <section className="tab-panel">
            <div className="monster-grid">
              {monsters.map((monster) => (
                <MonsterCard
                  key={monster.id}
                  monster={monster}
                  hp={getMonsterHp(state, monster.id)}
                  selected={monster.id === state.selectedMonsterId}
                  onSelect={() => selectMonster(monster)}
                />
              ))}
            </div>
          </section>
        </TabStripTab>
        <TabStripTab title="Inventory">
          <section className="tab-panel two-column">
            <Card className="action-card battle-card">
              <CardHeader>
                <h2>Battle Board</h2>
                <p>Current hunt status</p>
              </CardHeader>
              <CardBody>
                {selectedMonster ? (
                  <>
                    <div className="battle-hero">
                      <MonsterMark monster={selectedMonster} />
                      <div>
                        <p className="eyebrow">Current target</p>
                        <h3>{selectedMonster.name}</h3>
                        <p>{selectedMonster.tagline}</p>
                      </div>
                    </div>
                    <ProgressBar value={selectedHp || 0} max={100} label={() => `${selectedHp}% HP`} />
                    <div className="button-row">
                      <Button themeColor="primary" onClick={() => openEvidence()}>
                        Add evidence
                      </Button>
                      <Button
                        themeColor="success"
                        disabled={!isBossUnlocked(state)}
                        onClick={() => setBossOpen(true)}
                      >
                        Challenge final boss
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="empty">Pick an idea monster to start collecting evidence.</p>
                )}
              </CardBody>
            </Card>

            <Card className="action-card loot-card">
              <CardHeader>
                <h2>Loot Inventory</h2>
                <p>Practical wins collected</p>
              </CardHeader>
              <CardBody>
                <Grid data={state.loot} style={{ maxHeight: 420 }}>
                  <GridColumn field="name" title="Loot" />
                  <GridColumn field="type" title="Type" width="160px" />
                  <GridColumn field="source" title="Source" width="120px" />
                  <GridColumn field="damage" title="DMG" width="90px" />
                </Grid>
              </CardBody>
            </Card>
          </section>
        </TabStripTab>
        <TabStripTab title="Boss Result">
          <section className="tab-panel result-panel">
            <Card className="result-card boss-card">
              <CardHeader>
                <h2>Final Boss: So What?!</h2>
                <p>Turn collected evidence into a decision</p>
              </CardHeader>
              <CardBody>
                {state.bossResult ? (
                  <div className="result-copy">
                    <div className="reward-header">
                      <div className="boss-orb small">?!</div>
                      <div>
                        <p className="eyebrow">Boss defeated</p>
                        <h3>Conference Takeaway Ready to Share.</h3>
                      </div>
                    </div>
                    <section className="reward-section insight-reward">
                      <span className="reward-number">1</span>
                      <div>
                        <p className="eyebrow">Final Insight</p>
                        <p>{state.bossResult.insight}</p>
                      </div>
                    </section>
                    <section className="reward-section action-reward">
                      <span className="reward-number">2</span>
                      <div>
                        <p className="eyebrow">Next Action</p>
                        <p>{state.bossResult.nextAction}</p>
                      </div>
                    </section>
                    <section className="reward-section share-reward">
                      <span className="reward-number">3</span>
                      <div>
                        <div className="reward-title-row">
                          <p className="eyebrow">Team Share Summary</p>
                          <Button themeColor="secondary" size="small" onClick={copyTeamSummary}>
                            Copy summary
                          </Button>
                        </div>
                        <p>{state.bossResult.shareSummary}</p>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="locked-boss">
                    <div className="boss-orb">?!</div>
                    <p>
                      Collect three pieces of loot, then challenge the final boss
                      to turn conference ideas into a concrete action.
                    </p>
                    <Button
                      themeColor="success"
                      disabled={!isBossUnlocked(state)}
                      onClick={() => setBossOpen(true)}
                    >
                      Challenge final boss
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </section>
        </TabStripTab>
        <TabStripTab title="Organizer">
          <section className="tab-panel dashboard">
            <Card className="dashboard-card scale-card">
              <CardHeader>
                <h2>Engagement Signals at Scale</h2>
                <p>Local demo data today, event-wide pattern tomorrow</p>
              </CardHeader>
              <CardBody>
                <div className="scale-metrics">
                  <div>
                    <span>Evidence signals</span>
                    <strong>{dashboard.totalEvidence}</strong>
                    <p>Claims, concerns, and next actions captured from attendees.</p>
                  </div>
                  <div>
                    <span>Loot generated</span>
                    <strong>{dashboard.totalLoot}</strong>
                    <p>Evidence converted into practical, reusable takeaways.</p>
                  </div>
                  <div>
                    <span>Top source</span>
                    <strong>{dashboard.topSource}</strong>
                    <p>Where the strongest engagement signal is coming from.</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card className="dashboard-card recommendation-card">
              <CardHeader>
                <h2>Organizer Recommendations</h2>
                <p>At scale, every attendee hunt becomes an engagement signal for organizers.</p>
              </CardHeader>
              <CardBody>
                <div className="recommendation-list">
                  {dashboard.recommendations.map((recommendation) => (
                    <div className="recommendation-item" key={recommendation}>
                      <span>Signal</span>
                      <p>{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
            <Card className="dashboard-card">
              <CardHeader>
                <h2>Aggregate Signals</h2>
                <p>Which ideas produced practical loot</p>
              </CardHeader>
              <CardBody>
                <Chart>
                  <ChartTitle text="Loot by monster" />
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem categories={dashboard.monsterNames} />
                  </ChartCategoryAxis>
                  <ChartSeries>
                    <ChartSeriesItem type="column" data={dashboard.lootByMonster} />
                  </ChartSeries>
                </Chart>
              </CardBody>
            </Card>
            <Card className="dashboard-card">
              <CardHeader>
                <h2>Evidence Sources</h2>
                <p>Where useful signals came from</p>
              </CardHeader>
              <CardBody>
                <Chart>
                  <ChartTitle text="Where signals came from" />
                  <ChartCategoryAxis>
                    <ChartCategoryAxisItem categories={dashboard.sourceNames} />
                  </ChartCategoryAxis>
                  <ChartSeries>
                    <ChartSeriesItem type="bar" data={dashboard.lootBySource} />
                  </ChartSeries>
                </Chart>
              </CardBody>
            </Card>
          </section>
        </TabStripTab>
      </TabStrip>

      {evidenceOpen && selectedMonster && (
        <Dialog title={`Evidence for ${selectedMonster.name}`} onClose={() => setEvidenceOpen(false)}>
          <Form
            initialValues={{ source: preferredSource }}
            onSubmit={(values) => addEvidence(values as EvidenceFormValues)}
            render={(formRenderProps) => (
              <FormElement className="evidence-form">
                <Field name="source" label="Source" component={FieldSource} validator={required} />
                <div className="suggested-question">
                  <div className="suggested-question-heading">
                    <span>Suggested question to collect better evidence</span>
                    <Button
                      fillMode="flat"
                      size="small"
                      type="button"
                      onClick={() =>
                        copySuggestedQuestion(
                          formRenderProps.valueGetter("source") as EvidenceSource | undefined
                        )
                      }
                    >
                      Copy
                    </Button>
                  </div>
                  <p>
                    {getSuggestedQuestion(
                      formRenderProps.valueGetter("source") as EvidenceSource | undefined,
                      selectedMonster
                    )}
                  </p>
                </div>
                <Field
                  name="claim"
                  label="Hype claim"
                  component={FieldInput}
                  validator={required}
                />
                <Field
                  name="proof"
                  label="Evidence heard"
                  component={FieldTextArea}
                  validator={required}
                />
                <Field
                  name="practicalUse"
                  label="Practical use"
                  component={FieldTextArea}
                  rows={2}
                />
                <DialogActionsBar>
                  <Button onClick={() => setEvidenceOpen(false)}>Cancel</Button>
                  <Button
                    themeColor="primary"
                    type="submit"
                    disabled={!formRenderProps.allowSubmit}
                  >
                    Convert to loot
                  </Button>
                </DialogActionsBar>
              </FormElement>
            )}
          />
        </Dialog>
      )}

      {bossOpen && (
        <Dialog title="Final Boss: So What?!" onClose={() => setBossOpen(false)}>
          <div className="boss-dialog">
            <div className="boss-orb">?!</div>
            <p>
              Use your strongest loot to generate one practical insight and one
              next action with a short team share summary.
            </p>
          </div>
          <DialogActionsBar>
            <Button onClick={() => setBossOpen(false)}>Cancel</Button>
            <Button themeColor="success" onClick={defeatBoss}>
              Defeat boss
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}

      <NotificationGroup className="notifications">
        {toasts.map((toast) => (
          <Notification
            key={toast.id}
            type={{ style: toast.type, icon: true }}
            closable
            onClose={() =>
              setToasts((items) => items.filter((item) => item.id !== toast.id))
            }
          >
            <span>{toast.message}</span>
          </Notification>
        ))}
      </NotificationGroup>
    </main>
  );
}

const MonsterCard = ({
  monster,
  hp,
  selected,
  onSelect
}: {
  monster: Monster;
  hp: number;
  selected: boolean;
  onSelect: () => void;
}) => (
  <Card className={`monster-card ${selected ? "selected" : ""} ${hp === 0 ? "defeated" : ""}`}>
    <CardHeader>
      <MonsterMark monster={monster} />
      <div>
        <span className="card-badge">{hp === 0 ? "Defeated" : `${hp} HP`}</span>
        <h2>{monster.name}</h2>
        <p>{monster.tagline}</p>
      </div>
    </CardHeader>
    <CardBody>
      <p>
        <strong>Weakness:</strong> {monster.weakness}
      </p>
      <ProgressBar value={hp} max={100} label={() => `${hp}% HP`} />
      <Button themeColor={selected ? "success" : "primary"} onClick={onSelect}>
        {selected ? "Hunting" : "Pick monster"}
      </Button>
    </CardBody>
  </Card>
);

const MonsterMark = ({ monster }: { monster: Monster }) => (
  <div className="monster-mark" style={{ "--monster-color": monster.color } as React.CSSProperties}>
    <span />
    <i />
  </div>
);

const buildDashboard = (state: GameState) => {
  const monsterNames = monsters.map((monster) => monster.name);
  const lootByMonster = monsters.map(
    (monster) => state.loot.filter((loot) => loot.monsterId === monster.id).length
  );
  const sourceNames = evidenceSources;
  const lootBySource = evidenceSources.map(
    (source) => state.loot.filter((loot) => loot.source === source).length
  );
  const evidenceBySource = evidenceSources.map(
    (source) => state.evidence.filter((evidence) => evidence.source === source).length
  );
  const topSourceIndex = evidenceBySource.reduce(
    (topIndex, count, index) => (count > evidenceBySource[topIndex] ? index : topIndex),
    0
  );
  const topSource = state.evidence.length > 0 ? evidenceSources[topSourceIndex] : "No signals yet";
  const recommendations = buildOrganizerRecommendations(state);

  return {
    monsterNames,
    lootByMonster,
    sourceNames,
    lootBySource,
    totalEvidence: state.evidence.length,
    totalLoot: state.loot.length,
    topSource,
    recommendations
  };
};

const buildOrganizerRecommendations = (state: GameState) => {
  const signalsByMonster = monsters.map((monster) => {
    const evidenceCount = state.evidence.filter(
      (evidence) => evidence.monsterId === monster.id
    ).length;
    const lootCount = state.loot.filter((loot) => loot.monsterId === monster.id).length;

    return {
      monster,
      signalCount: evidenceCount + lootCount
    };
  });
  const mostHunted = [...signalsByMonster].sort((a, b) => b.signalCount - a.signalCount)[0];
  const sourceCount = (source: EvidenceSource) =>
    state.evidence.filter((evidence) => evidence.source === source).length +
    state.loot.filter((loot) => loot.source === source).length;
  const metricSignals = [...state.evidence, ...state.loot].filter((item) =>
    /metric|measure|evaluation|evaluate|benchmark|score|kpi/i.test(
      "claim" in item
        ? `${item.claim} ${item.proof} ${item.practicalUse}`
        : `${item.name} ${item.value} ${item.type}`
    )
  ).length;
  const recommendations: string[] = [];

  if (mostHunted && mostHunted.signalCount > 0) {
    recommendations.push(
      metricSignals === 0
        ? `${mostHunted.monster.name} is the most hunted monster, but metric evidence is low. Ask the next speaker to share concrete evaluation methods.`
        : `${mostHunted.monster.name} is drawing the strongest attendee signal. Give the next related session a practical evaluation prompt.`
    );
  } else {
    recommendations.push(
      "No hunts yet. Start with one seeded monster and ask attendees to capture one claim, one concern, and one next action."
    );
  }

  recommendations.push(
    sourceCount("Sponsor Booth") < 2
      ? "Sponsor evidence is low. Add sponsor booth prompts that help attendees ask about real use cases and poor-fit scenarios."
      : "Sponsor booth evidence is showing up. Share the strongest use-case questions with sponsors before the next break."
  );

  recommendations.push(
    sourceCount("Hallway Conversation") < 2
      ? "Hallway evidence is low. Create a 10-minute low-pressure discussion prompt after the next session."
      : "Hallway conversations are producing useful signals. Reserve space for attendee-led reflection after high-hype sessions."
  );

  return recommendations.slice(0, 3);
};

export default App;
