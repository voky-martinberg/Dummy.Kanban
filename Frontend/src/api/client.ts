import type { Board, BoardEvent, Section, Task, TaskFields } from './types';

// The app's own API, under the app's path (e.g. /employee/it-lab/api/).
// Behind Front Door, a plain /api/ would reach MyVoky's backend instead.
const apiBaseUrl = `${import.meta.env.BASE_URL}api/`;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  const res = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url} misslyckades: ${res.status} ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

/** Kolumner och swimlanes har identiska endpoints, bara olika bas-URL. */
const sectionApi = (base: string) => ({
  create: (name: string) => request<Section>('POST', base, { name }),
  rename: (id: number, name: string) => request<Section>('PUT', `${base}/${id}`, { name }),
  remove: (id: number) => request<void>('DELETE', `${base}/${id}`),
  /** `ids` ska innehålla alla sektionens id:n i ny ordning. */
  reorder: (ids: number[]) => request<void>('PUT', `${base}/order`, { ids }),
});

export const api = {
  getBoard: () => request<Board>('GET', 'board'),
  getEvents: () => request<BoardEvent[]>('GET', 'events'),

  columns: sectionApi('columns'),
  swimlanes: sectionApi('swimlanes'),

  tasks: {
    create: (fields: TaskFields) => request<Task>('POST', 'tasks', fields),
    update: (id: number, title: string, description: string | null) =>
      request<Task>('PUT', `tasks/${id}`, { title, description }),
    move: (id: number, columnId: number, swimlaneId: number, position: number) =>
      request<Task>('PUT', `tasks/${id}/move`, { columnId, swimlaneId, position }),
    remove: (id: number) => request<void>('DELETE', `tasks/${id}`),
  },
};
