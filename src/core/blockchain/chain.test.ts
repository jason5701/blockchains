import { Chain } from './chain';

describe('Chain 함수 체크', () => {
  let node: Chain = new Chain();

  it('getChain() 함수 체크', () => {
    console.log(node.getChain());
  });

  it('getLength() 함수 체크', () => {
    console.log(node.getLength());
  });

  it('getLatestBlock() 함수 체크', () => {
    console.log(node.getLatestBlock());
  });

  it('addBlock 함수체크', () => {
    for (let i = 1; i <= 300; i++) {
      // node.addBlock([`Block #${i}`]);
    }

    console.log(node.getChain());
  });
});
