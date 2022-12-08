import { Block } from '@core/blockchain/block';
import { DIFFICULTY_ADJUSTMENT_INTERVAL } from '@core/config';
import { Transaction } from '@core/transaction/transaction';
import { TxIn } from '@core/transaction/txin';
import { TxOut } from '@core/transaction/txout';

export class Chain {
  private blockchain: Block[];
  public unspentTxOuts: IUnspentTxOut[];

  constructor() {
    this.blockchain = [Block.createIONIQ(Block.getIONIQ())];
    this.unspentTxOuts = [];
  }

  public getUnspentTxOuts(): IUnspentTxOut[] {
    return this.unspentTxOuts;
  }

  public appendUTXO(utxo: IUnspentTxOut[]): void {
    this.unspentTxOuts.push(...utxo);
  }

  public getChain(): Block[] {
    return this.blockchain;
  }

  public getLength(): number {
    return this.blockchain.length;
  }

  public getLatestBlock(): Block {
    return this.blockchain[this.blockchain.length - 1];
  }

  public miningBlock(_account: string): Failable<Block, string> {
    // ToDo : Transaction 객체 만들어주는 코드
    const txin: ITxIn = new TxIn('', this.getLatestBlock().height + 1);
    const txout: ITxOut = new TxOut(_account, 50);
    const coinbaseTransaction: Transaction = new Transaction([txin], [txout]);
    const utxo = coinbaseTransaction.createUTXO();
    this.appendUTXO(utxo);

    // ToDo : addBlock() 호출
    return this.addBlock([coinbaseTransaction]);
  }

  public addBlock(data: ITransaction[]): Failable<Block, string> {
    const previousBlock = this.getLatestBlock();
    const adjustmentBlock: Block = this.getAdjustmentBlock(); // -10번째 블록 구하기
    const newBlock = Block.generateBlock(previousBlock, data, adjustmentBlock);
    const isValid = Block.isValidNewBlock(newBlock, previousBlock);

    if (isValid.isError) return { isError: true, error: isValid.error };

    this.blockchain.push(newBlock);

    return { isError: false, value: newBlock };
  }

  public addToChain(_receivedBlock: Block): Failable<undefined, string> {
    const isValid = Block.isValidNewBlock(
      _receivedBlock,
      this.getLatestBlock()
    );
    if (isValid.isError) return { isError: true, error: isValid.error };

    this.blockchain.push(_receivedBlock);
    return { isError: false, value: undefined };
  }

  // 체인 검증 코드
  public isValidChain(_chain: Block[]): Failable<undefined, string> {
    // ToDo : 제네시스 블록을 검사하는 코드
    // const genesis = _chain[0]

    // ToDo : 나머지 체인에 대한 검증 코드
    for (let i = 1; i < _chain.length; i++) {
      const newBlock = _chain[i];
      const previousBlock = _chain[i - 1];
      const isValid = Block.isValidNewBlock(newBlock, previousBlock);
      if (isValid.isError) return { isError: true, error: isValid.error };
    }
    return { isError: false, value: undefined };
  }

  // 체인 교체 코드
  public replaceChain(receivedChain: Block[]): Failable<undefined, string> {
    const latestReceivedBlock: Block = receivedChain[receivedChain.length - 1];
    const latestBlock: Block = this.getLatestBlock();
    if (latestReceivedBlock.height === 0) {
      return { isError: true, error: '받은 최신 블록이 제네시스 블록' };
    }

    if (latestReceivedBlock.height <= latestBlock.height) {
      return { isError: true, error: '자신의 블록이 더 길거나 같습니다.' };
    }

    // 체인 바꿔주는 코드 (내 체인이 더 짧다면)
    this.blockchain = receivedChain;

    return { isError: false, value: undefined };
  }

  public getAdjustmentBlock() {
    // ToDo : 블록의 interval을 상수로 정해놓기. (블록 몇 개를 기준으로 난이도를 측정할 것인가)
    // 현재 마지막 블록에서 - 10 (DIFFICULTY_ADJUSTMENT_INTERVAL)
    const currentLength = this.getLength();
    const adjustmentBlock: Block =
      this.getLength() < DIFFICULTY_ADJUSTMENT_INTERVAL
        ? Block.getIONIQ()
        : this.blockchain[currentLength - DIFFICULTY_ADJUSTMENT_INTERVAL];
    return adjustmentBlock; // 블록 자체를 반환
  }
}
