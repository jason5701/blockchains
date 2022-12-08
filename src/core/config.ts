export const IONIQ: IBlock = {
  version: '1.0.0',
  height: 0,
  timestamp: new Date().getTime(),
  hash: '0'.repeat(64),
  previousHash: '0'.repeat(64),
  merkleRoot: '0'.repeat(64),
  difficulty: 0,
  nonce: 0,
  data: [
    'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
  ],
};

/**
 * adjust block range
 */
export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

/**
 * block generate // 10*60=600
 */
export const BLOCK_GENERATION_INTERVAL: number = 10;

/**
 * time(sec)
 */
export const BLOCK_GENERATION_TIME_UNIT: number = 60;
