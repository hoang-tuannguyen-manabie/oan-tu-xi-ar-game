const base = import.meta.env.BASE_URL || '/';
const asset = (relPath: string) => `${base}${relPath.replace(/^\/+/, '')}`;

export const MANABIE_MARK = asset('assets/brand/manabie-mark.svg');

export const BRAND_MASCOTS = {
  welcomeV3Loop: asset('assets/tutorial/popup-mascot-welcome-v3/mana-welcome-loop-v3.gif'),
  welcomeV2Loop: asset('assets/tutorial/popup-mascot-welcome-v2/mana-welcome-loop-v2.gif'),
  cameraLoadingAnimated: asset('assets/tutorial/popup-mascot-welcome-v3/mana-welcome-loop-v3.gif'),
  explore: asset('assets/brand/mascots/mana-explore.png'),
  inspect: asset('assets/brand/mascots/mana-inspect.png'),
  celebrate: asset('assets/brand/mascots/mana-celebrate.png'),
  cheer: asset('assets/brand/mascots/mana-cheer.png'),
  victory: asset('assets/brand/mascots/mana-cheer.png'),
  defeat: asset('assets/brand/mascots/mana-inspect.png'),
  time: asset('assets/brand/mascots/mana-time.png'),
};
