

export enum GameStatus {
  Idea = 1,
  Planning = 2,
  Developing = 3,
  Live = 4,
  Retired = 5
}

export const GameStatuses: { id: GameStatus, name: string }[] = [
  { id: GameStatus.Idea, name: "Idea" },
  { id: GameStatus.Planning, name: "Planning" },
  { id: GameStatus.Developing, name: "Developing" },
  { id: GameStatus.Live, name: "Live" },
  { id: GameStatus.Retired, name: "Retired" }
];
