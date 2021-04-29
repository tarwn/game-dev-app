import produce from 'immer';
import { writable } from 'svelte/store';
import { Task, tasksApi } from './tasksApi';

function createOpenTasksStore() {
  const { subscribe, set } = writable<{ gameId: number | null, tasks: Task[] }>(null);
  let tasks = [] as Task[];
  let gameId: number | null = null;
  set({ gameId, tasks });

  const load = (newGameId: number) => {
    gameId = newGameId;
    return tasksApi.getOpenTasks(gameId)
      .then(loadedTasks => {
        if (newGameId != gameId) return;
        tasks = produce(tasks, () => loadedTasks);
        set({ gameId, tasks });
      });
  };

  return {
    subscribe,
    load
  };
}

export const openTasksStore = createOpenTasksStore();
