import type { Dataset, DatasetId } from './dataset';
import { PULSE_DEMO_DATASET } from './pulseDemo';
import { SAMPLE_DATASET } from './sampleDataset';

export const DATASETS: Record<DatasetId, Dataset> = {
  'pulse-demo': PULSE_DEMO_DATASET,
  sample: SAMPLE_DATASET,
};
