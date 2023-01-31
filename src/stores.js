import { derived, writable } from "svelte/store";

const versionCommands = {
  fourThreeToFourFour: {
    unsafeCommands: [
      "acc",
      "dterm",
      "dyn",
      "ff",
      "gps_rescue_angle",
      "gps_rescue_initial_alt",
      "gps_rescue_min_dth",
      "gyro",
      "name",
      "osd_nvario_pos",
      "osd_stat_battery",
      "osd_stat_bb_no",
      "osd_stat_bbox",
      "osd_stat_flight_dist",
      "osd_stat_max_alt",
      "osd_stat_max_curr",
      "osd_stat_max_dist",
      "osd_stat_max_esc_temp",
      "osd_stat_max_g_force",
      "osd_stat_min_batt",
      "osd_stat_min_rssi",
      "osd_stat_tim_2",
      "osd_stat_total_dist",
      "osd_stat_total_time",
      "osd_warn_link_quality",
      "rc",
    ],
    safeCommands: [
      "aux",
      "beacon",
      "blackbox",
      "batch",
      "board",
      "debug_mode",
      "dshot",
      "beeper",
      "feature",
      "led",
      "map",
      "max_check",
      "min_check",
      "osd",
      "sbus",
      "serial",
      "idle_min_rpm",
      "manufacturer",
      "name",
      "resource",
      "small_angle",
      "vtx",
      "vtxtable",
      "yaw_motors_reversed",
      "save",
    ],
    unsafeSections: ["rateprofile"],
  },
  fourTwoToFourThree: {
    unsafeCommands: ["acc", "dterm", "dyn", "ff", "gyro", "rc"],
    safeCommands: [
      "aux",
      "beacon",
      "blackbox",
      "batch",
      "board",
      "debug_mode",
      "dshot",
      "beeper",
      "feature",
      "led",
      "map",
      "max_check",
      "min_check",
      "osd",
      "sbus",
      "serial",
      "idle_min_rpm",
      "manufacturer",
      "name",
      "resource",
      "small_angle",
      "vtx",
      "vtxtable",
      "yaw_motors_reversed",
      "save",
    ],
    unsafeSections: ["rateprofile"],
  },
};
export let unsafeCommands = writable([
  ...versionCommands["fourThreeToFourFour"].unsafeCommands,
]);
export let safeCommands = writable(
  versionCommands["fourThreeToFourFour"].safeCommands
);
export let unsafeSections = writable(
  versionCommands["fourThreeToFourFour"].unsafeSections
);

export const allValues = derived(
  [safeCommands, unsafeCommands, unsafeSections],
  ([$safeCommands, $unsafeCommands, $unsafeSections]) => {
    return [...$safeCommands, ...$unsafeSections, ...$unsafeCommands];
  },
  []
);

export const setVersionCommands = function (version) {
  if (!versionCommands[version]) {
    return;
  }
  safeCommands.set(versionCommands[version].safeCommands);
  unsafeCommands.set(versionCommands[version].unsafeCommands);
  unsafeSections.set(versionCommands[version].unsafeSections);
};
