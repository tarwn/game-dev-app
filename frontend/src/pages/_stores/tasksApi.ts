import { log } from "../../utilities/logger";
import { jsonOrThrow, throwFor401 } from "../_communications/responseHandler";


export type Task = {
  id: number,
  taskType: TaskType,
  gameId: number,
  taskState: TaskState,
  dueDate: Date | null
};

export enum TaskType {
  Concept = 1,
  Goals = 2,
  Groundwork = 3,
  BusinessModel = 4,
  RiskAnalysis = 5,
  ProjectPlan = 6,
  CostForecast = 7,
  Comparables = 8,
  ProfitForecast = 9,
  MarketingStrategy = 10
}

export enum TaskState {
  Open = 1,
  ClosedComplete = 2,
  ClosedSkipped = 3
}

function extractTask(data: any) {
  return {
    id: data.id,
    taskType: data.taskType,
    gameId: data.gameId,
    taskState: data.taskState,
    dueDate: data.dueDate != null ? new Date(data.dueDate) : null
  };
}

export const tasksApi = {
  getOpenTasks: (gameId: number): Promise<Array<Task>> => {
    log("TasksAPI.getOpenTasks(): started", {});
    return fetch(`/api/fe/gameTasks/${gameId}/open`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("TasksAPI.getOpenTasks():JSON data received", {});
        return data.map(d => extractTask(d));
      });
  },

  getAllTasks: (gameId: number): Promise<Array<Task>> => {
    log("TasksAPI.getAllTasks(): started", {});
    return fetch(`/api/fe/gameTasks/${gameId}/all`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("TasksAPI.getAllTasks():JSON data received", {});
        return data.map(d => extractTask(d));
      });
  },

  assignTask: (gameId: number, taskId: number): Promise<void> => {
    log("TasksAPI.assignTask(): started", {});
    return fetch(`/api/fe/gameTasks/${gameId}/task/${taskId}/assignToMe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({})
    }).then(throwFor401)
      .then(jsonOrThrow)
      .then(() => {
        log("TasksAPI.assignTask():JSON data received", {});
      });
  },

  updateTaskState: (gameId: number, taskId: number, taskState: TaskState): Promise<void> => {
    log("TasksAPI.updateTaskState(): started", {});
    return fetch(`/api/fe/gameTasks/${gameId}/task/${taskId}/assignToMe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        taskState
      })
    }).then(throwFor401)
      .then(jsonOrThrow)
      .then(() => {
        log("TasksAPI.updateTaskState():JSON data received", {});
      });
  },
};
