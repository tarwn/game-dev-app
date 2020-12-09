import { getNextSectionInLine } from "./businessModelUsage";

describe("businessModelUsage", () => {
  describe("getNextSection", () => {
    it.each`
    curSection                 | nextSection
    ${null}                    | ${'customers'}
    ${'customers'}             | ${'valueProposition'}
    ${'valueProposition'}      | ${'channels'}
    ${'channels'}              | ${'customerRelationships'}
    ${'customerRelationships'} | ${'revenue'}
    ${'revenue'}               | ${'keyResources'}
    ${'keyResources'}          | ${'keyActivities'}
    ${'keyActivities'}         | ${'keyPartners'}
    ${'keyPartners'}           | ${'costStructure'}
    ${'costStructure'}         | ${null}
    `("The next section after $curSection is $nextSection", ({ curSection, nextSection }) => {
      const nextActSection = getNextSectionInLine(curSection);
      expect(nextActSection).toEqual(nextSection);
    });
  });

});
