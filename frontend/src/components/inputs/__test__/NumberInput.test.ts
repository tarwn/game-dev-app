import NumberInput from "../NumberInput.svelte";
import { fireEvent, render } from "@testing-library/svelte";

describe("NumberInput", () => {
  it("Renders initial value", () => {
    const { getByRole } = render(NumberInput, { decimalScale: 1 });

    const numberInput = getByRole('textbox') as HTMLInputElement;

    expect(numberInput.value).toBe("0.0");
  });

  it("Parses and formats a raw entered value", async () => {
    const { getByRole } = render(NumberInput, { value: 0, min: 0, max: 10000, decimalScale: 1 });

    const numberInput = getByRole('textbox') as HTMLInputElement;
    numberInput.value = "1234.5";
    await fireEvent.focusOut(numberInput);
    await fireEvent.blur(numberInput);

    expect(numberInput.value).toBe("1,234.5");
  });

  it("Parses and formats a raw entered value w/ appropriate rounding", async () => {
    const { getByRole } = render(NumberInput, { value: 0, min: 0, max: 10000, decimalScale: 0 });

    const numberInput = getByRole('textbox') as HTMLInputElement;
    numberInput.value = "1234.5";
    await fireEvent.focusOut(numberInput);
    await fireEvent.blur(numberInput);

    expect(numberInput.value).toBe("1,235");
  });

  it("Reports invalid error for a value that is below the min and leaves the value set to bad value to be fixed", async () => {
    const { component, getByRole } = render(NumberInput, { value: 5, min: 1, max: 10, decimalScale: 1 });
    let validationCounter = 0;
    let latestValidState = undefined;
    component.$on("validation", (e) => {
      validationCounter++;
      latestValidState = e.detail.isValid;
    });

    const numberInput = getByRole('textbox') as HTMLInputElement;
    numberInput.value = "0.5";
    await fireEvent.focusOut(numberInput);
    await fireEvent.blur(numberInput);

    expect(validationCounter).toBe(1);
    expect(latestValidState).toBe(false);
    expect(numberInput.value).toBe("0.5");
  });

  it("Reports invalid error for a value that is above the max and leaves the value set to bad value to be fixed", async () => {
    const { component, getByRole } = render(NumberInput, { value: 5, min: 1, max: 10, decimalScale: 1 });
    let validationCounter = 0;
    let latestValidState = undefined;
    component.$on("validation", (e) => {
      validationCounter++;
      latestValidState = e.detail.isValid;
    });

    const numberInput = getByRole('textbox') as HTMLInputElement;
    numberInput.value = "100";
    await fireEvent.focusOut(numberInput);
    await fireEvent.blur(numberInput);

    expect(validationCounter).toBe(1);
    expect(latestValidState).toBe(false);
    expect(numberInput.value).toBe("100");
  });

  it("Reports valid validation event error for a value that is between min/max", async () => {
    const { component, getByRole } = render(NumberInput, { value: 5, min: 1, max: 10, decimalScale: 1 });
    let validationCounter = 0;
    let latestValidState = undefined;
    component.$on("validation", (e) => {
      validationCounter++;
      latestValidState = e.detail.isValid;
    });

    const numberInput = getByRole('textbox') as HTMLInputElement;
    numberInput.value = "6";
    await fireEvent.focusOut(numberInput);
    await fireEvent.blur(numberInput);

    expect(validationCounter).toBe(1);
    expect(latestValidState).toBe(true);
    expect(numberInput.value).toBe("6.0");
  });

  it("Reports invalid error and then valid again when it is fixed", async () => {
    const { component, getByRole } = render(NumberInput, { value: 5, min: 1, max: 10, decimalScale: 1 });
    let validationCounter = 0;
    let latestValidState = undefined;
    component.$on("validation", (e) => {
      validationCounter++;
      latestValidState = e.detail.isValid;
    });

    const numberInput = getByRole('textbox') as HTMLInputElement;
    numberInput.value = "0";
    await fireEvent.focusOut(numberInput);
    await fireEvent.blur(numberInput);

    numberInput.value = "4";
    await fireEvent.focusOut(numberInput);
    await fireEvent.blur(numberInput);

    expect(validationCounter).toBe(2);
    expect(latestValidState).toBe(true);
    expect(numberInput.value).toBe("4.0");
  });
});
