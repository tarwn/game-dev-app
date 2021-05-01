

export enum ModuleLinkType {
  External = 0,
  GameDetails = 1,
  BusinessModel = 2,
  CashForecast = 3,
  Comparables = 4,
  MarketingStrategy = 5,
  // RiskAnalysis = 6
}

export const isModuleAvailable = (type: ModuleLinkType): boolean => {
  switch (type) {
    case ModuleLinkType.External: return false;
    case ModuleLinkType.GameDetails: return false;
    case ModuleLinkType.BusinessModel: return true;
    case ModuleLinkType.CashForecast: return true;
    case ModuleLinkType.Comparables: return false;
    case ModuleLinkType.MarketingStrategy: return false;
    default:
      throw new Error(`Undefined module link type, cannot determine availability. Module type: ${ModuleLinkType[type]}`);
  }
};

export const getModuleName = (type: ModuleLinkType): string => {
  switch (type) {
    case ModuleLinkType.External: return "External Task";
    case ModuleLinkType.GameDetails: return "Game Details";
    case ModuleLinkType.BusinessModel: return "Business Model";
    case ModuleLinkType.CashForecast: return "Cash Forecast";
    case ModuleLinkType.Comparables: return "Comparables";
    case ModuleLinkType.MarketingStrategy: return "Marketing Plan";
    default:
      throw new Error(`Undefined module link type, cannot generate readable name. Module type: ${ModuleLinkType[type]}`);
  }
};

export const getModuleImageHref = (type: ModuleLinkType): string => {
  switch (type) {
    case ModuleLinkType.External: return "/images/External.svg";
    case ModuleLinkType.GameDetails: return "/images/GameDetails.svg";
    case ModuleLinkType.BusinessModel: return "/images/BusinessModelCanvas.svg";
    case ModuleLinkType.CashForecast: return "/images/FinanceForecast.svg";
    case ModuleLinkType.Comparables: return "/images/Comparables.svg";
    case ModuleLinkType.MarketingStrategy: return "/images/MarketingPlan.svg";
    default:
      throw new Error(`Undefined module link type, cannot map to image href. Module type: ${ModuleLinkType[type]}`);
  }
};



export const getModuleUrl = (type: ModuleLinkType, gameId: string): string => {
  switch (type) {
    // case ModuleLinkType.External: return "External Task";
    case ModuleLinkType.GameDetails: return `/games/${gameId}/details`;
    case ModuleLinkType.BusinessModel: return `/games/${gameId}/businessModel`;
    case ModuleLinkType.CashForecast: return `/games/${gameId}/cashForecast`;
    case ModuleLinkType.Comparables: return `/games/${gameId}/comparables`;
    case ModuleLinkType.MarketingStrategy: return `/games/${gameId}/marketingPlan`;
    default:
      throw new Error(`Undefined module link type, cannot generate readable link. Module type: ${ModuleLinkType[type]}`);
  }
};
