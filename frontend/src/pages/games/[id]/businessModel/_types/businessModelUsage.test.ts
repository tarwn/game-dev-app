import { createBusinessModelCustomer, createEmptyBusinessModel, createIdentifiedPrimitive } from "../../../../../testUtils/dataModel";
import { getNextSection } from "./businessModelUsage";

describe("businessModelUsage", () => {
  it("reports customer when not customers added yet", () => {
    const businessModel = createEmptyBusinessModel();
    const nextIs = getNextSection(businessModel);
    expect(nextIs).toEqual("customer");
  });

  it("reports valueProp when customer added but no value prop values yet", () => {
    const businessModel = createEmptyBusinessModel();
    businessModel.customers.list.push(createBusinessModelCustomer(businessModel));
    const nextIs = getNextSection(businessModel);
    expect(nextIs).toEqual("valueProposition");
  });

  it("reports null when all other options are populated", () => {
    const businessModel = createEmptyBusinessModel();
    businessModel.customers.list.push(createBusinessModelCustomer(businessModel));
    businessModel.valueProposition.genres.list.push(createIdentifiedPrimitive<string>(businessModel.valueProposition.genres.globalId, businessModel.valueProposition.genres.globalId + "x", "dummy value"));
    const nextIs = getNextSection(businessModel);
    expect(nextIs).toEqual(null);
  });
});
