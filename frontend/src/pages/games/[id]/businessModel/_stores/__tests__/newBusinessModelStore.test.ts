import { createEventStore } from "../eventSystem/eventStore";
import { eventApplier } from "../newBusinessModelStore";

test("placeholder", () => {
  expect(1).toBe(1);
});

// describe("businessModelEventStore", () => {
//   it("publishes the full initial state after retriving it", (done) => {
//     const eventStore = createEventStore(api, eventApplier);

//     const unsubscribe = eventStore.subscribe(chg => {
//       expect(chg.finalState).not.toBeNull();
//       unsubscribe();
//       done();
//     });
//     businessModelEventStore.initialize("abc123", "unit-test")
//       .then(() => {
//         businessModelEventStore.loadFullState();
//       });


//   });
// });

