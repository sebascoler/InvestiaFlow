import { DEFAULT_STAGES, Stage } from '../types/stage';

/** @deprecated Use DEFAULT_STAGES from types/stage or useStages() hook instead */
export const STAGES = DEFAULT_STAGES;
export { DEFAULT_STAGES };

/** Generate STAGE_COLORS from a stages array */
export const getStageColors = (stages: Stage[]): Record<string, { bg: string; border: string }> => {
  const colors: Record<string, { bg: string; border: string }> = {};
  for (const stage of stages) {
    colors[stage.id] = {
      bg: `bg-${stage.color}-100`,
      border: `border-${stage.color}-300`,
    };
  }
  return colors;
};

/** @deprecated Use getStageColors() with dynamic stages instead */
export const STAGE_COLORS = getStageColors(DEFAULT_STAGES);

export const FOLLOW_UP_DAYS = 14;
