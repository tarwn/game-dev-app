export enum PredefinedIcons {
  Plus,
  Expand,
  Next,
  Previous,
  Undo,
  Redo,
  Download,
  Edit,
  Delete,
  InProgress,
  Check,
  ConstructionAlert,
  ConstructionPC,
  GraphicAdd,
  Pencil,
  Star,
  StarOutline,

  Deny,
  Gear,
  UserConfig,
  GamePad,
  Pin,
  Unpin
}

const PredefinedIconsMap = new Map<PredefinedIcons | string, string>([
  [PredefinedIcons.Plus, "true-UIEssentials_button_circle_round_add"],
  [PredefinedIcons.Expand, "true-Arrows_thin_arrows_fullscreen_directions_full_screen"],
  [PredefinedIcons.Next, "true-UIEssentials_button_circle_round_arrow_next"],
  [PredefinedIcons.Previous, "true-UIEssentials_button_circle_round_arrow_previous"],
  [PredefinedIcons.Undo, "true-Email_reply_arrow_left_direction_undo"],
  [PredefinedIcons.Redo, "true-Email_forward_message_arrow_right"],
  [PredefinedIcons.Download, "true-FilesandFolders_file_download"],
  [PredefinedIcons.Edit, "true-GraphicDesign_pencil"],
  [PredefinedIcons.Delete, "true-UIEssentials_trash_bin_delete"],
  [PredefinedIcons.InProgress, "true-UIEssentials_time_clock"],
  [PredefinedIcons.Check, "true-Check"],
  [PredefinedIcons.ConstructionAlert, "true-Construction_attention_alert"],
  [PredefinedIcons.ConstructionPC, "true-Construction_pc_computer_engineering"],
  [PredefinedIcons.GraphicAdd, "true-GraphicDesign_picture_add"],
  [PredefinedIcons.Pencil, "true-GraphicDesign_pencil"],
  [PredefinedIcons.Star, "true-UIEssentials_star"],
  [PredefinedIcons.StarOutline, "true-UIEssentials_star_outline"],
  [PredefinedIcons.Deny, "true-UIEssentials_deny"],
  [PredefinedIcons.Gear, "true-UIEssentials_settings_cog_gear"],
  [PredefinedIcons.UserConfig, "true-Users_female_user_config_configuration"],
  [PredefinedIcons.GamePad, "true-Videogames_controller_joystick_games_video_console"],
  [PredefinedIcons.Pin, "true-Construction_attention_alert"],
  [PredefinedIcons.Unpin, "true-Construction_attention_alert"],
]);

export const getIconString = (icon: PredefinedIcons | string): string => {
  if (PredefinedIconsMap.has(icon)) {
    return PredefinedIconsMap.get(icon);
  }
  return icon as string;
};
