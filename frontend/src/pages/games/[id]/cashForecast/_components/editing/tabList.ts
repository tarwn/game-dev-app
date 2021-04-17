import { ForecastStage } from "../../_types/cashForecast";


export enum TabType {
  General = 0,
  AssetsAndFunding = 1,
  People = 2,
  OtherExpenses = 3,
  DirectExpenses = 4,
  MarketingAndSales = 5,
  GeneralExpenses = 6,
  Taxes = 9,
  EstUnitSales = 10,
  Alternates = 20,
  TableView = 30,
}

type IsVisibleForStage = (stage: ForecastStage) => boolean;
const IsAlwaysVisible = (): boolean => true;
const IsVisibleAfterCost = (stage: ForecastStage): boolean => (stage != ForecastStage.ViabilityCost);

export const tabs: Array<{ id: TabType, group: string, url: string, text: string, isVisible: IsVisibleForStage }> = [
  { id: TabType.General, group: "1", url: "general", text: "General", isVisible: IsAlwaysVisible },
  { id: TabType.AssetsAndFunding, group: "1", url: "assets", text: "Assets & Funding", isVisible: IsAlwaysVisible },
  { id: TabType.People, group: "1", url: "people", text: "People", isVisible: IsAlwaysVisible },
  { id: TabType.DirectExpenses, group: "1", url: "directexp", text: "Direct Expenses", isVisible: IsAlwaysVisible },
  { id: TabType.MarketingAndSales, group: "1", url: "maexp", text: "Mktg & Sales", isVisible: IsAlwaysVisible },
  { id: TabType.GeneralExpenses, group: "1", url: "genexp", text: "General Expenses", isVisible: IsAlwaysVisible },
  { id: TabType.Taxes, group: "1", url: "taxes", text: "Taxes", isVisible: IsVisibleAfterCost },
  { id: TabType.EstUnitSales, group: "2", url: "estUnitSales", text: "Est. Unit Sales", isVisible: IsVisibleAfterCost },
  { id: TabType.Alternates, group: "2", url: "alts", text: "What If...", isVisible: IsVisibleAfterCost },
  { id: TabType.TableView, group: "3", url: "table", text: "Table View", isVisible: IsAlwaysVisible },
];
