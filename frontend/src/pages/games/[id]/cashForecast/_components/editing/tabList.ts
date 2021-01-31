

export enum TabType {
  AssetsAndFunding = 1,
  People = 2,
  ToolsAndLicenses = 3,
  Services = 4,
  OtherExpenses = 5,
  Revenue = 6,
  TableView = 7,
}

export const tabs: Array<{ id: TabType, group: string, text: string }> = [
  { id: TabType.AssetsAndFunding, group: "1", text: "Assets & Funding" },
  { id: TabType.People, group: "1", text: "People" },
  { id: TabType.ToolsAndLicenses, group: "1", text: "Tools & Licenses" },
  { id: TabType.Services, group: "1", text: "Services" },
  { id: TabType.OtherExpenses, group: "1", text: "Other Expenses" },
  { id: TabType.Revenue, group: "2", text: "Revenue" },
  { id: TabType.TableView, group: "3", text: "Table View" },
];
