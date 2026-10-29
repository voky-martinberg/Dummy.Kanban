import { useTheme } from '../../hooks/useTheme';
import type { Theme } from '../../hooks/useTheme';
import './TopBar.css';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: '☀ Ljust' },
  { value: 'dark', label: '☾ Mörkt' },
];

/** Logga, knappanelen och temaväljaren uppe till höger. */
export function TopBar({
  canCreateTask,
  onNewColumn,
  onNewLane,
  onNewTask,
}: {
  canCreateTask: boolean;
  onNewColumn: () => void;
  onNewLane: () => void;
  onNewTask: () => void;
}) {
  const [theme, setTheme] = useTheme();

  return (
    <header className='topbar'>
      <div className='brand'>
        <span className='brand-mark' aria-hidden='true' />
        <h1>Dum jävla app jävel</h1>
      </div>
      <div className='topbar-right'>
        <div className='toolbar'>
          <button className='btn' onClick={onNewColumn}>
            + Kolumn
          </button>
          <button className='btn' onClick={onNewLane}>
            + Swimlane
          </button>
          <button
            className='btn btn-primary'
            disabled={!canCreateTask}
            title={canCreateTask ? undefined : 'Skapa minst en kolumn och en swimlane först'}
            onClick={onNewTask}
          >
            + Uppgift
          </button>
        </div>
        <div className='toolbar theme-switch' role='group' aria-label='Tema'>
          {THEMES.map(({ value, label }) => (
            <button
              key={value}
              className={`btn${theme === value ? ' btn-active' : ''}`}
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
