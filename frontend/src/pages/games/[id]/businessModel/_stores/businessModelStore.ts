import { writable } from 'svelte/store';
import type { IBusinessModel } from '../_types/businessModel';

interface ICommand {
  command: (args: any) => IEvent,
  apply: (model: IBusinessModel, event: IEvent) => void
}

interface IEvent {
  action: string;
}

const commands = new Map<string, ICommand>([
  [
    "Event-AddNewCustomer", {
      command: () => ({ action: "Event-AddNewCustomer" }),
      apply: (model: IBusinessModel) => model.customers.push({ globalId: null, name: null, entries: [] })
    }
  ],
  [
    "Event-AddCustomerEntry", {
      command: ({ customerIndex, entry }: { customerIndex: number, entry: string }) => ({ action: "Event-AddCustomerEntry", customerIndex, entry }),
      apply: (model: IBusinessModel, event: IEvent) => model.customers[event.customerIndex].entries.push({ globalId: null, entry: event.entry })
    }
  ]
]);

function log(subject: string, args: any) {
  console.group(`%c${subject}`, 'color: blue; background-color: #FFFFCC;');
  console.log(args);
  console.groupEnd();
}

function createStore() {
  const { subscribe, set, update } = writable(null);

  // const latestSynchronizedState = null;
  const localLatestState = null;
  const outstandingEvents = [] as IEvent[];

  const executeLocalCommand = (model: IBusinessModel, command: ICommand, args?: any) => {
    const event = command.command(args);
    outstandingEvents.push(event);
    command.apply(model, event);
    log(`Event Applied [Local Command]: ${event.action}`, event);
    return model;
  };

  console.log(commands.get("Event-AddCustomerEntry"));
  return {
    subscribe,
    set: (data: IBusinessModel) => set(data),
    addNewCustomer: () => update((b: IBusinessModel) => executeLocalCommand(b, commands.get("Event-AddNewCustomer"))),
    addCustomerText: (customerIndex: number, entry: string) => update((b: IBusinessModel) => executeLocalCommand(b, commands.get("Event-AddCustomerEntry"), { customerIndex, entry })),
    reset: () => set(null)
  };
}

export const businessModelStore = createStore();
