import { log } from "../../utilities/logger";
import { jsonOrThrow, throwFor401 } from "../_communications/responseHandler";



export type Studio = {
  name: string;
  billingPlan: BillingPlan;
  trialStart: Date | null;
  trialEnd: Date | null;
}

export enum BillingPlan {
  EarlyAccessFlatFee = 1,
  SmallIndieFlatFee = 2,
  GrowingStudioFlatFee = 3
}

export const BillingPlans: { id: BillingPlan, name: string }[] = [
  { id: BillingPlan.EarlyAccessFlatFee, name: "Early Access" },
  { id: BillingPlan.SmallIndieFlatFee, name: "Small Indie" },
  { id: BillingPlan.GrowingStudioFlatFee, name: "Growing Studio" },
];


export const studioApi = {
  get: (): Promise<Studio> => {
    log("StudioAPI.get(): started", {});

    return fetch(`/api/fe/studio`)
      .then(jsonOrThrow)
      .then((data: any) => {
        return {
          name: data.name,
          billingPlan: data.billingPlan,
          trialStart: data.trialStart != null ? new Date(data.trialStart) : null,
          trialEnd: data.trialEnd != null ? new Date(data.trialEnd) : null
        } as Studio;
      });
  },

  updateName: (name: string): Promise<void> => {
    log("StudioAPI.updateName(): started", {});
    return fetch(`/api/fe/studio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        name
      })
    }).then(throwFor401)
      .then(() => {
        log("StudioAPI.updateName():complete", {});
      });
  },
};
