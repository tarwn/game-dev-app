import { log } from "../../utilities/logger";
import { jsonOrThrow, throwFor401 } from "../_communications/responseHandler";
import { getModuleName, getModuleUrl, ModuleLinkType } from "../_types/modules";
import { GameStatus } from "./types";


export type Task = {
  id: number,
  taskType: TaskType,
  gameId: string,
  taskState: TaskState,
  dueDate: Date | null
};

export type DetailedTask = Task & {
  moduleType: ModuleLinkType;
  moduleName: string;
  moduleHref: string;
  // these will be overridable by customer/recurring tasks later
  title: string;
  shortDescription: string;
  gameStatus: GameStatus;
  // calculated field
  isOverdue: boolean;
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

const TaskTypeToGameStatus = new Map<TaskType, GameStatus>([
  [TaskType.Concept, GameStatus.Idea],
  [TaskType.Goals, GameStatus.Idea],
  [TaskType.Groundwork, GameStatus.Idea],
  [TaskType.BusinessModel, GameStatus.Idea],
  [TaskType.RiskAnalysis, GameStatus.Planning],
  [TaskType.ProjectPlan, GameStatus.Planning],
  [TaskType.CostForecast, GameStatus.Planning],
  [TaskType.Comparables, GameStatus.Planning],
  [TaskType.ProfitForecast, GameStatus.Planning],
  [TaskType.MarketingStrategy, GameStatus.Planning]
]);

export enum TaskState {
  Open = 1,
  ClosedComplete = 2,
  ClosedSkipped = 3
}

// detail items - projected values

type BuiltInTaskDetail = {
  title: string;
  shortDescription: string;
  moduleType: ModuleLinkType;
  moduleName: string;
};

const bitd = (title: string, moduleType: ModuleLinkType, shortDescription: string): BuiltInTaskDetail => {
  return {
    title,
    shortDescription,
    moduleType,
    moduleName: getModuleName(moduleType)
  };
};

const defaults = new Map<TaskType, BuiltInTaskDetail>([
  [TaskType.Concept, bitd("Concept", ModuleLinkType.GameDetails, "Creating your initial game idea.")],
  [TaskType.Goals, bitd("Goals", ModuleLinkType.GameDetails, "Write down your goals for this game release.")],
  // eslint-disable-next-line max-len
  [TaskType.Groundwork, bitd("Project Groundwork", ModuleLinkType.GameDetails, "Quickly define the working methods, decision-making, storage of assets, etc.")],
  // eslint-disable-next-line max-len
  [TaskType.BusinessModel, bitd("Business Outline", ModuleLinkType.BusinessModel, "Initial definition: unique concept/hook, audience, resources, and cashflow.")],
  // eslint-disable-next-line max-len
  [TaskType.RiskAnalysis, bitd("Risk Analysis", ModuleLinkType.External, "Discover your largest risks: identify areas to prototype, research, or otherwise test.")],
  // eslint-disable-next-line max-len
  [TaskType.ProjectPlan, bitd("Project Plan", ModuleLinkType.External, "Prepare your high-level project plan for building and releasing the game.")],
  // eslint-disable-next-line max-len
  [TaskType.CostForecast, bitd("Cost Forecast", ModuleLinkType.CashForecast, "Cost viaibility: can you afford to build this game based on what you know so far?")],
  // eslint-disable-next-line max-len
  [TaskType.Comparables, bitd("Comparables", ModuleLinkType.Comparables, "Research to learn from others w/ similar games, input for forecasts, etc.")],
  // eslint-disable-next-line max-len
  [TaskType.ProfitForecast, bitd("Profit Forecast", ModuleLinkType.CashForecast, "Profit viability: can this game reach it's goals, financially?")],
  [TaskType.MarketingStrategy, bitd("Marketing v0.0.0.1", ModuleLinkType.MarketingStrategy, "Create the initial marketing plan.")],
]);

export const mapToDetailedTask = (task: Task): DetailedTask => {
  if (defaults.has(task.taskType)) {
    const details = defaults.get(task.taskType);
    // eslint-disable-next-line max-len
    const gameStatus = /* task.gameStatus ?? */ TaskTypeToGameStatus.has(task.taskType) ? TaskTypeToGameStatus.get(task.taskType) : GameStatus.Developing;
    return {
      ...task,
      moduleType: details.moduleType,
      moduleName: details.moduleName,
      moduleHref: details.moduleType != ModuleLinkType.External ? getModuleUrl(details.moduleType, task.gameId) : "#",
      title: details.title,
      shortDescription: details.shortDescription,
      gameStatus,
      isOverdue: !!task.dueDate && task.dueDate < new Date()
    };
  }
  throw new Error(`Non-default tasks are not yet supported. TaskType ${task.taskType} on task id ${task.id}`);
};

// end detail itemds

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
  getOpenTasks: (gameId: string): Promise<Array<Task>> => {
    log("TasksAPI.getOpenTasks(): started", {});
    return fetch(`/api/fe/gameTasks/${gameId}/open`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("TasksAPI.getOpenTasks():JSON data received", {});
        return data.map(d => extractTask(d));
      });
  },

  getAllTasks: (gameId: string): Promise<Array<Task>> => {
    log("TasksAPI.getAllTasks(): started", {});
    return fetch(`/api/fe/gameTasks/${gameId}/all`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("TasksAPI.getAllTasks():JSON data received", {});
        return data.map(d => extractTask(d));
      });
  },

  getAssignedTask: (gameId: string): Promise<Task | null> => {
    log("TasksAPI.getAssignedTask(): started", {});
    return fetch(`/api/fe/gameTasks/${gameId}/task/assigned`)
      .then(jsonOrThrow)
      .then((data: any) => {
        log("TasksAPI.getAssignedTask():JSON data received", {});
        return data != null ? extractTask(data) : null;
      });
  },

  assignTask: (gameId: string, taskId: number): Promise<void> => {
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

  updateTaskState: (gameId: string, taskId: number, taskState: TaskState): Promise<void> => {
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
