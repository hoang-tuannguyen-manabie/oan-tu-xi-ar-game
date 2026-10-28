const base = (import.meta as any).env?.BASE_URL || '/';
const asset = (relPath: string) => `${base}${relPath.replace(/^\/+/, '')}`;

export const MANABIE_MARK = asset('assets/brand/manabie-mark.svg');

export const BRAND_MASCOTS = {
  welcomeV3Loop: asset('assets/tutorial/popup-mascot-welcome-v3/mana-welcome-loop-v3.gif'),
  welcomeV2Loop: asset('assets/tutorial/popup-mascot-welcome-v2/mana-welcome-loop-v2.gif'),
  cameraLoadingAnimated: asset('assets/tutorial/popup-mascot-welcome-v3/mana-welcome-loop-v3.gif'),
  explore: asset('assets/brand-mascot/mana-explore.png'),
  inspect: asset('assets/brand-mascot/mana-inspect.png'),
  celebrate: asset('assets/brand-mascot/mana-present.png'),
  cheer: asset('assets/brand-mascot/mana-action.png'),
  victory: asset('assets/brand-mascot/mana-action.png'),
  defeat: asset('assets/brand-mascot/mana-inspect.png'),
  time: asset('assets/brand-mascot/mana-time.png'),
};
