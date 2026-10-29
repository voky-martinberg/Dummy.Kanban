import { useCallback, useState } from 'react';
import type { Task } from './api/types';
import { Board } from './components/board/Board';
import { NameDialog } from './components/dialogs/NameDialog';
import { TaskDialog } from './components/dialogs/TaskDialog';
import { EmptyState } from './components/layout/EmptyState';
import { ErrorBanner } from './components/layout/ErrorBanner';
import { TopBar } from './components/layout/TopBar';
import { useBoard } from './hooks/useBoard';
import { SECTION_TEXT } from './lib/sections';
import type { SectionKind } from './lib/sections';

type Dialog = { type: 'section'; kind: SectionKind } | { type: 'task'; task?: Task };

export default function App() {
  const { board, error, clearError, actions } = useBoard();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);

  if (!board) {
    return <main className='app'>{error ? <ErrorBanner message={error} /> : <p className='muted'>Laddar…</p>}</main>;
  }

  const hasColumns = board.columns.length > 0;
  const hasLanes = board.swimlanes.length > 0;
  const newSection = (kind: SectionKind) => () => setDialog({ type: 'section', kind });
  const openTask = dialog?.type === 'task' ? dialog.task : undefined;

  return (
    <main className='app'>
      <TopBar
        canCreateTask={hasColumns && hasLanes}
        onNewColumn={newSection('column')}
        onNewLane={newSection('lane')}
        onNewTask={() => setDialog({ type: 'task' })}
      />

      {error && <ErrorBanner message={error} onClose={clearError} />}

      {!(hasColumns && hasLanes) && (
        <EmptyState
          hasColumns={hasColumns}
          hasLanes={hasLanes}
          onNewColumn={newSection('column')}
          onNewLane={newSection('lane')}
        />
      )}

      {hasColumns && <Board board={board} actions={actions} onOpenTask={(task) => setDialog({ type: 'task', task })} />}

      {dialog?.type === 'section' && (
        <NameDialog
          title={SECTION_TEXT[dialog.kind].newTitle}
          placeholder={SECTION_TEXT[dialog.kind].placeholder}
          onClose={closeDialog}
          onSave={(name) => {
            closeDialog();
            void actions.createSection(dialog.kind, name);
          }}
        />
      )}

      {dialog?.type === 'task' && (
        <TaskDialog
          task={openTask}
          columns={board.columns}
          swimlanes={board.swimlanes}
          onClose={closeDialog}
          onSave={(fields) => {
            closeDialog();
            void (openTask ? actions.updateTask(openTask, fields) : actions.createTask(fields));
          }}
          onDelete={
            openTask &&
            (() => {
              closeDialog();
              void actions.deleteTask(openTask.id);
            })
          }
        />
      )}
    </main>
  );
}
