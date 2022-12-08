import { IONIQ } from '@core/config';
import { Block } from './block';

describe('Block 검증', () => {
  let newBlock: Block;

  it('블록 생성 테스트', () => {
    const data = ['Block #2'];

    newBlock = Block.generateBlock(IONIQ, data);

    console.log(newBlock);
  });

  it('블록 검증 테스트', () => {
    const isValidBlock = Block.isValidNewBlock(newBlock, IONIQ);

    if (isValidBlock.isError) {
      console.error(isValidBlock.error);
      return expect(true).toBe(false);
    }

    expect(isValidBlock.isError).toBe(false);
  });
});
