export enum PredefinedIcons {
  Plus,
  Expand,
  Next,
  Previous,
  Undo,
  Redo,
  Download
}

const PredefinedIconsMap = new Map<PredefinedIcons | string, string>([
  [PredefinedIcons.Plus, "true-UIEssentials_button_circle_round_add"],
  [PredefinedIcons.Expand, "true-Arrows_thin_arrows_fullscreen_directions_full_screen"],
  [PredefinedIcons.Next, "true-UIEssentials_button_circle_round_arrow_next"],
  [PredefinedIcons.Previous, "UIEssentials_button_circle_round_arrow_previous"],
  [PredefinedIcons.Undo, "true-Email_reply_arrow_left_direction_undo"],
  [PredefinedIcons.Redo, "true-Email_forward_message_arrow_right"],
  [PredefinedIcons.Download, "true-FilesandFolders_file_download"],
]);

export const getIconString = (icon: PredefinedIcons | string): string => {
  if (PredefinedIconsMap.has(icon)) {
    return PredefinedIconsMap.get(icon);
  }
  return icon as string;
};
