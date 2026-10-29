/** Kolumn eller swimlane: en namngiven, sorterbar sektion av tavlan. */
export type Section = { id: number; name: string; position: number }
export type Column = Section
export type Swimlane = Section

export type Task = {
  id: number
  title: string
  description: string | null
  columnId: number
  swimlaneId: number
  /** Ordning inom cellen (kolumn × swimlane), 0-baserad. */
  position: number
}

/** Det som går att sätta på en uppgift från gränssnittet. */
export type TaskFields = Pick<Task, 'title' | 'description' | 'columnId' | 'swimlaneId'>

export type Board = { columns: Column[]; swimlanes: Swimlane[]; tasks: Task[] }
