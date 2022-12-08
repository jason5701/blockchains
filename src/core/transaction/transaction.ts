import { SHA256 } from 'crypto-js';
import { TxIn } from './txin';
import { TxOut } from './txout';
import { UnspentTxOut } from './unspentTxOut';

export class Transaction {
  public hash: string;
  public txIns: TxIn[];
  public txOuts: TxOut[];

  constructor(_txIns: TxIn[], _txOuts: TxOut[]) {
    this.txIns = _txIns;
    this.txOuts = _txOuts;
    this.hash = this.createTransactionHash();
  }

  createTransactionHash(): string {
    const txoutcontent: string = this.txOuts
      .map((v) => Object.values(v).join(''))
      .join('');
    const txinContent: string = this.txIns
      .map((v) => Object.values(v).join(''))
      .join('');

    console.log(txinContent, txoutcontent);

    return SHA256(txoutcontent + txinContent).toString();
  }

  createUTXO(): UnspentTxOut[] {
    const utxo: UnspentTxOut[] = this.txOuts.map(
      (txout: TxOut, index: number) => {
        return new UnspentTxOut(this.hash, index, txout.account, txout.amount);
      }
    );
    return utxo;
  }
}
