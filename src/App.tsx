import { useCallback, useMemo, useState } from 'react';
import './utils/chartSetup';
import type { DistView, NavSectionKey, ProviderFilter, SeverityFilter, TimelineView } from './types';
import { INITIAL_BUDGET, INITIAL_PATTERN } from './data/anomalies';
import { useSavedAnomalies } from './hooks/useSavedAnomalies';
import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { PageHeader } from './components/PageHeader';
import { StatsRow } from './components/StatsRow';
import { AnomalyTimelineChart } from './components/AnomalyTimelineChart';
import { DistributionCard } from './components/DistributionCard';
import { TableControls } from './components/TableControls';
import { BudgetTable } from './components/BudgetTable';
import { PatternTable } from './components/PatternTable';

type Tab = 'budget' | 'pattern';

function App() {
  const [budget, setBudget] = useState(INITIAL_BUDGET);
  const [pattern, setPattern] = useState(INITIAL_PATTERN);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<NavSectionKey, boolean>>({
    inventory: false,
    economics: true,
    compliance: false,
  });

  const [activeTab, setActiveTab] = useState<Tab>('budget');
  const [distView, setDistView] = useState<DistView>('provider');
  const [timelineView, setTimelineView] = useState<TimelineView>('all');

  const [activeSev, setActiveSev] = useState<SeverityFilter>('all');
  const [activeProvider, setActiveProvider] = useState<ProviderFilter>('all');
  const [search, setSearch] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);

  const { isSaved, toggle: toggleSave, saved } = useSavedAnomalies();
  const { theme, toggle: toggleTheme } = useTheme();

  const toggleSection = useCallback((key: NavSectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resolveBudget = useCallback((id: string) => {
    setBudget((prev) => prev.map((a) => (a.id === id ? { ...a, stat: 'resolved' } : a)));
  }, []);

  const resolvePattern = useCallback((id: string) => {
    setPattern((prev) => prev.map((a) => (a.id === id ? { ...a, stat: 'resolved' } : a)));
  }, []);

  const searchQ = search.toLowerCase().trim();
  const matchesFilters = useCallback(
    (a: { sev: string; prov: string; id: string; svc: string; acct: string }) =>
      (activeSev === 'all' || a.sev === activeSev) &&
      (activeProvider === 'all' || a.prov === activeProvider) &&
      (!savedOnly || saved.has(a.id)) &&
      (!searchQ || a.svc.toLowerCase().includes(searchQ) || a.acct.toLowerCase().includes(searchQ)),
    [activeSev, activeProvider, savedOnly, saved, searchQ],
  );

  const clearQuickFilters = useCallback(() => {
    setActiveSev('all');
    setActiveProvider('all');
  }, []);

  const filteredBudget = useMemo(() => budget.filter(matchesFilters), [budget, matchesFilters]);
  const filteredPattern = useMemo(() => pattern.filter(matchesFilters), [pattern, matchesFilters]);

  const stats = useMemo(() => {
    const all = [...budget, ...pattern];
    return {
      total: all.length,
      critical: all.filter((a) => a.sev === 'critical').length,
      budgetActive: budget.filter((a) => a.stat !== 'resolved').length,
      patternActive: pattern.filter((a) => a.stat !== 'resolved').length,
    };
  }, [budget, pattern]);

  return (
    <div className="app">
      <Sidebar collapsed={sidebarCollapsed} openSections={openSections} onToggleSection={toggleSection} />

      <div className={`main${sidebarCollapsed ? ' expanded' : ''}`}>
        <Topbar onToggleSidebar={() => setSidebarCollapsed((v) => !v)} theme={theme} onToggleTheme={toggleTheme} />

        <main className="content">
          <PageHeader />

          <StatsRow
            total={stats.total}
            critical={stats.critical}
            budgetActive={stats.budgetActive}
            budgetTotal={budget.length}
            patternActive={stats.patternActive}
            patternTotal={pattern.length}
            isAllActive={activeSev === 'all'}
            isCriticalActive={activeSev === 'critical'}
            isBudgetActive={activeTab === 'budget'}
            isPatternActive={activeTab === 'pattern'}
            onSelectAll={() => setActiveSev('all')}
            onToggleCritical={() => setActiveSev((prev) => (prev === 'critical' ? 'all' : 'critical'))}
            onSelectBudget={() => setActiveTab('budget')}
            onSelectPattern={() => setActiveTab('pattern')}
          />

          <div className="charts-row">
            <div className="card" style={{ padding: '1.45rem 1.64rem 1.09rem' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Anomaly Timeline</div>
                  <div className="card-subtitle">Daily count · Apr 6 – May 7, 2026</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div className="dist-toggle">
                    <button
                      className={`dist-toggle-btn${timelineView === 'all' ? ' active' : ''}`}
                      onClick={() => setTimelineView('all')}
                    >
                      All anomalies
                    </button>
                    <button
                      className={`dist-toggle-btn${timelineView === 'budget' ? ' active' : ''}`}
                      onClick={() => setTimelineView('budget')}
                    >
                      Budget
                    </button>
                    <button
                      className={`dist-toggle-btn${timelineView === 'pattern' ? ' active' : ''}`}
                      onClick={() => setTimelineView('pattern')}
                    >
                      Pattern-based
                    </button>
                  </div>
                </div>
              </div>
              <AnomalyTimelineChart budget={budget} pattern={pattern} theme={theme} view={timelineView} />
              <div className="chart-legend">
                {timelineView !== 'pattern' && (
                  <div className="legend-item">
                    <div className="legend-line" style={{ background: '#ef4444' }} />
                    Budget-Based
                  </div>
                )}
                {timelineView !== 'budget' && (
                  <div className="legend-item">
                    <div className="legend-line" style={{ background: '#8b5cf6' }} />
                    Pattern-Based
                  </div>
                )}
              </div>
            </div>

            <DistributionCard budget={budget} pattern={pattern} view={distView} onChangeView={setDistView} theme={theme} />
          </div>

          <div className="card anomaly-card">
            <div className="tab-bar">
              <div className={`tab${activeTab === 'budget' ? ' active' : ''}`} onClick={() => setActiveTab('budget')}>
                Budget-Based <span className="tab-badge">{filteredBudget.length}</span>
              </div>
              <div className={`tab${activeTab === 'pattern' ? ' active' : ''}`} onClick={() => setActiveTab('pattern')}>
                Pattern-Based <span className="tab-badge">{filteredPattern.length}</span>
              </div>
            </div>

            <TableControls
              search={search}
              onSearchChange={setSearch}
              activeSev={activeSev}
              onSetSev={setActiveSev}
              activeProvider={activeProvider}
              onSetProvider={setActiveProvider}
              onClearAll={clearQuickFilters}
              savedOnly={savedOnly}
              onToggleSavedOnly={() => setSavedOnly((v) => !v)}
              savedCount={saved.size}
            />

            <div className={`tab-panel${activeTab === 'budget' ? ' active' : ''}`}>
              <BudgetTable rows={filteredBudget} isSaved={isSaved} onToggleSave={toggleSave} onResolve={resolveBudget} />
            </div>
            <div className={`tab-panel${activeTab === 'pattern' ? ' active' : ''}`}>
              <PatternTable rows={filteredPattern} isSaved={isSaved} onToggleSave={toggleSave} onResolve={resolvePattern} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
