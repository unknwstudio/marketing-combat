// The single source of truth for the React GameChrome <-> Phaser game contract. Both sides import
// these names, so a rename is one edit and a typo surfaces as an undefined-property error instead of
// a silently-unheard event. Pure constants — no window/DOM access, safe under SSR / static export.
//   chrome -> game:  PAUSE | RESUME | RESTART | MENU | CONFIRM | MUTE | OVERLAY
//   game  -> chrome:  SCENE | RESULT
export const MK = {
  PAUSE: 'mk:pause',
  RESUME: 'mk:resume',
  RESTART: 'mk:restart',
  MENU: 'mk:menu',
  CONFIRM: 'mk:confirm',
  MUTE: 'mk:mute',
  OVERLAY: 'mk:overlay',
  SCENE: 'mk:scene',
  RESULT: 'mk:result',
};
