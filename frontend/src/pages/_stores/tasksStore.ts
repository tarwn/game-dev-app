import produce from 'immer';
import { writable } from 'svelte/store';
import { DetailedTask, mapToDetailedTask, tasksApi } from './tasksApi';

function createOpenTasksStore() {
  const { subscribe, set } = writable<{ gameId: string | null, tasks: DetailedTask[] }>(null);
  let tasks = [] as DetailedTask[];
  let gameId: string | null = null;
  set({ gameId, tasks });

  const load = (newGameId: string) => {
    gameId = newGameId;
    return tasksApi.getOpenTasks(gameId)
      .then(loadedTasks => {
        if (newGameId != gameId) return;
        tasks = produce(tasks, () => {
          if (loadedTasks == null) {
            return null;
          }
          loadedTasks.sort(sortTasks);
          return loadedTasks.map(t => mapToDetailedTask(t));
        });
        set({ gameId, tasks });
      });
  };

  return {
    subscribe,
    load
  };
}

function sortTasks(a: any, b: any) {
  return a.taskTypeId - b.taskTypeId;
}

function createActiveTaskStore() {
  const { subscribe, set } = writable<{ gameId: string | null, task: DetailedTask | null }>(null);
  let task: DetailedTask | null = null;
  let gameId: string | null = null;
  set({ gameId, task });

  const load = (newGameId: string) => {
    gameId = newGameId;
    return tasksApi.getAssignedTask(gameId)
      .then(loadedTask => {
        if (newGameId != gameId) return;
        task = produce(task, () => {
          if (loadedTask == null) {
            return null;
          }
          return mapToDetailedTask(loadedTask);
        });
        set({ gameId, task });
      });
  };

  return {
    subscribe,
    load
  };
}

export const openTasksStore = createOpenTasksStore();
export const activeTaskStore = createActiveTaskStore();
