import type { Identified, IIdentifiedList, IIdentifiedPrimitive } from "../pages/_stores/eventStore/types";
import type {
  BusinessModelCustomerType,
  IBusinessModel,
  IBusinessModelChannels,
  IBusinessModelCost,
  IBusinessModelCustomer,
  IBusinessModelCustomerRelationships,
  IBusinessModelKeyActivities,
  IBusinessModelKeyPartners,
  IBusinessModelKeyResources,
  IBusinessModelRevenue,
  IBusinessModelValueProposition
} from "../pages/games/[id]/businessModel/_types/businessModel";
import type {
  ICashForecast,
  IContractorExpense,
  IEmployeeExpense,
  IEstimatedRevenuePlatform,
  IFundingItem,
  IGenericExpense,
  ILoanItem,
  IRevenue,
  ITax
} from "../pages/games/[id]/cashForecast/_types/cashForecast";
import {
  ForecastLength,
  ForecastStage,
} from "../pages/games/[id]/cashForecast/_types/cashForecast";
import { createIdentifiedPrimitive, createObjectList } from "../pages/_stores/eventStore/helpers";

export function createEmptyBusinessModel(): IBusinessModel {
  return {
    globalId: "unit-test-bm",
    parentId: "unit-test",
    versionNumber: 1,
    customers: createObjectList<IBusinessModelCustomer>("unit-test-bm", "unit-test-bm-c", "customers"),
    valueProposition: createValueProposition("unit-test-bm", "unit-test-bm-vp", "valueProposition"),
    channels: createChannels("unit-test-bm", "unit-test-bm-channels", "channels"),
    customerRelationships: createWithEntriesOnly<IBusinessModelCustomerRelationships>(
      "unit-test-bm", "unit-test-bm-cr", "customerRelationships"),
    revenue: createWithEntriesOnly<IBusinessModelRevenue>("unit-test-bm", "unit-test-bm-rev", "revenue"),
    keyResources: createWithEntriesOnly<IBusinessModelKeyResources>("unit-test-bm", "unit-test-bm-kr", "keyResources"),
    keyActivities: createWithEntriesOnly<IBusinessModelKeyActivities>("unit-test-bm", "unit-test-bm-ka", "keyActivities"),
    keyPartners: createWithEntriesOnly<IBusinessModelKeyPartners>("unit-test-bm", "unit-test-bm-kp", "keyPartners"),
    costStructure: createObjectList<IBusinessModelCost>("unit-test-bm", "unit-test-bm-cost", "costStructure"),
  };
}


export function createBusinessModelCustomer(businessModel: IBusinessModel): IBusinessModelCustomer {
  const globalId = businessModel.customers.globalId + "[" + businessModel.customers.list.length + "]";
  return {
    parentId: businessModel.customers.globalId,
    globalId,
    name: createIdentifiedPrimitive<string>(globalId, globalId + "-name", "", "name"),
    type: createIdentifiedPrimitive<BusinessModelCustomerType>(globalId, globalId + "-type", "both", "type"),
    entries: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-entries", "entries")
  };
}

function createValueProposition(parentId: string, globalId: string, field?: string): IBusinessModelValueProposition {
  return {
    globalId,
    parentId,
    field,
    genres: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-genres", "genres"),
    platforms: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-platforms", "platforms"),
    entries: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-entries", "entries")
  };
}

function createChannels(parentId: string, globalId: string, field?: string): IBusinessModelChannels {
  return {
    globalId,
    parentId,
    field,
    awareness: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-awareness", "awareness"),
    consideration: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-consideration", "consideration"),
    purchase: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-purchase", "purchase"),
    postPurchase: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-postPurchase", "postPurchase")
  };
}

type IdentifiedHasEntries = Identified & {
  field?: string;
  entries: IIdentifiedList<IIdentifiedPrimitive<string>>;
};

export function createWithEntriesOnly<T extends IdentifiedHasEntries>(parentId: string, globalId: string, field?: string): T {
  return {
    globalId,
    parentId,
    field,
    entries: createObjectList<IIdentifiedPrimitive<string>>(globalId, globalId + "-entries", "entries")
  } as T;
}

export function createEmptyCashForecast(): ICashForecast {
  return {
    globalId: "unit-test-cf",
    parentId: "unit-test",
    versionNumber: 1,
    forecastStartDate: createIdentifiedPrimitive<Date>("unit-test-cf", "unit-test-cf-fsd", new Date(), "date"),
    launchDate: createIdentifiedPrimitive<Date>("unit-test-cf", "unit-test-cf-ld", new Date(), "date"),
    stage: createIdentifiedPrimitive<ForecastStage>("unit-test-cf", "unit-test-cf-s", ForecastStage.ViabilityCost, "stage"),
    length: createIdentifiedPrimitive<ForecastLength>("unit-test-cf", "unit-test-cf-s", ForecastLength.ToLaunch, "length"),
    forecastMonthCount: createIdentifiedPrimitive<number>("unit-test-cf", "unit-test-cf-fmc", 12),
    goals: {
      globalId: "unit-test-cf-g",
      parentId: "unit-test-cf",
      yourGoal: createIdentifiedPrimitive<number>("unit-test-cf-g", "unit-test-cf-g-yg", 0, "yourGoal"),
      partnerGoal: createIdentifiedPrimitive<number>("unit-test-cf-g", "unit-test-cf-g-pg", 0, "partnerGoal"),
    },
    bankBalance: {
      globalId: "unit-test-cf-bb",
      parentId: "unit-test-cf",
      name: createIdentifiedPrimitive<string>("unit-test-cf-bb", "unit-test-cf-bb-n", "example account", "name"),
      date: createIdentifiedPrimitive<Date>("unit-test-cf-bb", "unit-test-cf-bb-d", new Date(), "date"),
      amount: createIdentifiedPrimitive<number>("unit-test-cf-bb", "unit-test-cf-bb-a", 0, "amount"),
      monthlyInterestRate: createIdentifiedPrimitive<number>("unit-test-cf-bb", "unit-test-cf-bb-r", 0.0, "monthlyInterestRate")
    },
    loans: createObjectList<ILoanItem>("unit-test-cf", "unit-test-cf-l"),
    funding: createObjectList<IFundingItem>("unit-test-cf", "unit-test-cf-f"),
    employees: createObjectList<IEmployeeExpense>("unit-test-cf", "unit-test-cf-ee"),
    contractors: createObjectList<IContractorExpense>("unit-test-cf", "unit-test-cf-ce"),
    expenses: createObjectList<IGenericExpense>("unit-test-cf", "unit-test-cf-e"),
    taxes: createObjectList<ITax>("unit-test-cf", "unit-test-cf-tax"),
    revenues: createObjectList<IRevenue>("unit-test-cf", "unit-test-cf-r"),
    estimatedRevenue: {
      globalId: "unit-test-cf-er",
      parentId: "unit-test-cf",
      minimumPrice: createIdentifiedPrimitive<number>("unit-test-cf-er", "unit-test-cf-er-mip", 0, "minimumPrice"),
      targetPrice: createIdentifiedPrimitive<number>("unit-test-cf-er", "unit-test-cf-er-tp", 0, "targetPrice"),
      maximumPrice: createIdentifiedPrimitive<number>("unit-test-cf-er", "unit-test-cf-er-map", 0, "maximumPrice"),
      lowUnitsSold: createIdentifiedPrimitive<number>("unit-test-cf-er", "unit-test-cf-er-lus", 0, "lowUnitsSold"),
      targetUnitsSold: createIdentifiedPrimitive<number>("unit-test-cf-er", "unit-test-cf-er-tus", 0, "targetUnitsSold"),
      highUnitsSold: createIdentifiedPrimitive<number>("unit-test-cf-er", "unit-test-cf-er-hus", 0, "highUnitsSold"),
      platforms: createObjectList<IEstimatedRevenuePlatform>("unit-test-cf-er", "unit-test-cf-er-p"),
    }
  };
}

