declare interface ITxOut {
  account: string; // 해당하는 사람의 주소
  amount: number; // 잔액. (객체 안의 amount 속성값이 하나의 단위이다.)
}

declare interface ITxIn {
  txOutId: string; // ITransaction {} 의 hash 값
  txOutIndex: number; // ITransaction에 있는 txouts 배열의 인덱스
  signature?: string | undefined;
}

declare interface ITransaction {
  hash: string; // txIns, txOuts를 이용해 만든 hash값
  txOuts: ITxOut[];
  txIns: ITxIn[];
}

// TxIn은 UnspentTxOut[]를 참조해서 만들어진다.
// TxIn 만들 때 UnspentTxOut[]에서 삭제
// TxOut 만들 때 UnspentTxOut[]에 생성

declare interface IUnspentTxOut {
  txOutId: string; // TxOut을 담고 있는 트랙잭션의 hash값
  txOutIndex: number; // 트랙잭션의 txOuts 배열에서의 인덱스값
  account: string;
  amount: number;
}
