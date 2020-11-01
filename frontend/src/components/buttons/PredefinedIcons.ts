export enum PredefinedIcons {
  plus = 1
}

const PredefinedIconsMap = new Map<PredefinedIcons | string, string>([
  [PredefinedIcons.plus, "true-UIEssentials_button_circle_round_add"]
]);

export const getIconString = (icon: PredefinedIcons | string): string => {
  if (PredefinedIconsMap.has(icon)) {
    return PredefinedIconsMap.get(icon);
  }
  return icon as string;
};
