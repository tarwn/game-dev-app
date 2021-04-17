

export enum TabType {
  General = 0,
  AssetsAndFunding = 1,
  People = 2,
  DirectExpenses = 3,
  MarketingAndSales = 4,
  GeneralExpenses = 5,
  Taxes = 6,
  EstUnitSales = 7,
  Alternates = 20,
  TableView = 30,
}

export const tabs: Array<{ id: TabType, group: string, url: string, text: string }> = [
  { id: TabType.General, group: "1", url: "general", text: "General" },
  { id: TabType.AssetsAndFunding, group: "1", url: "assets", text: "Assets & Funding" },
  { id: TabType.People, group: "1", url: "people", text: "People" },
  { id: TabType.DirectExpenses, group: "1", url: "directexp", text: "Direct Expenses" },
  { id: TabType.MarketingAndSales, group: "1", url: "maexp", text: "Mktg & Sales" },
  { id: TabType.GeneralExpenses, group: "1", url: "genexp", text: "General Expenses" },
  { id: TabType.Taxes, group: "1", url: "taxes", text: "Taxes" },
  { id: TabType.EstUnitSales, group: "2", url: "estUnitSales", text: "Est. Unit Sales" },
  { id: TabType.Alternates, group: "2", url: "alts", text: "What If..." },
  { id: TabType.TableView, group: "3", url: "table", text: "Table View" },
];
