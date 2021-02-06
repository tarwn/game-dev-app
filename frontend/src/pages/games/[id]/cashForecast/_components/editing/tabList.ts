

export enum TabType {
  AssetsAndFunding = 1,
  People = 2,
  DirectExpenses = 3,
  MarketingAndSales = 4,
  GeneralExpenses = 5,
  Taxes = 6,
  Revenue = 7,
  TableView = 8,
}

export const tabs: Array<{ id: TabType, group: string, text: string }> = [
  { id: TabType.AssetsAndFunding, group: "1", text: "Assets & Funding" },
  { id: TabType.People, group: "1", text: "People" },
  { id: TabType.DirectExpenses, group: "1", text: "Direct Expenses" },
  { id: TabType.MarketingAndSales, group: "1", text: "Mktg & Sales" },
  { id: TabType.GeneralExpenses, group: "1", text: "General Expenses" },
  { id: TabType.Taxes, group: "1", text: "Taxes" },
  { id: TabType.Revenue, group: "2", text: "Revenue" },
  { id: TabType.TableView, group: "3", text: "Table View" },
];
