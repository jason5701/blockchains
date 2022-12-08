// BlockChain HTTP 서버

import express, { Request, Response } from 'express';
import peers from './peer.json';
import { Message, MessageType, P2PServer } from './src/server/p2p';
import { ReceivedTx, Wallet } from '@core/wallet/wallet';

const app = express();
const ws = new P2PServer();

app.use(express.json());

// 다른 사람이 내 노드의 블록을 조회하는 것을 방지하기 위함.
// header에 있는 authorization 조회
app.use((req: Request, res: Response, next) => {
  // req.headers.authorization type -> string | undefined
  const baseAuth: string = (req.headers.authorization || '').split(' ')[1];
  if (baseAuth === '') return res.status(401).send();

  const [userid, userpw] = Buffer.from(baseAuth, 'base64')
    .toString()
    .split(':');
  if (userid !== 'web7722' || userpw !== '1234') return res.status(401).send();
  // console.log(userid, userpw);

  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('bit_chain');
});

app.get('/chains', (req: Request, res: Response) => {
  res.json(ws.getChain());
});

app.post('/mineBlock', (req: Request, res: Response) => {
  const { data } = req.body;
  // const newBlock = ws.addBlock(data);
  const newBlock = ws.miningBlock(data);

  if (newBlock.isError) return res.status(500).send(newBlock.error);
  const msg: Message = {
    type: MessageType.latest_block,
    payload: {},
  };

  ws.broadcast(msg);

  res.json(newBlock.value);
});

app.post('/addToPeer', (req: Request, res: Response) => {
  const { peer } = req.body;

  ws.connectToPeer(peer);
});

app.get('/addPeers', (req: Request, res: Response) => {
  peers.forEach((peer) => {
    ws.connectToPeer(peer);
  });
});

app.get('/peers', (req: Request, res: Response) => {
  const sockets = ws
    .getSockets()
    .map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort);
  res.json(sockets);
});

app.post('/sendTransaction', (req, res) => {
  /* receivedTx 내용
      {
          sender: '02193cc6051f36c77b7dd92d21513b6517f5f8c7efca0f10441a8fa9c52b4fae2f',
          received: 'c0b87bcc610be3bf7d3b26f6dd6ae0a63bb97082',
          amount: 10,
          signature: Signature {
              r: BN { negative: 0, words: [Array], length: 10, red: null },
              s: BN { negative: 0, words: [Array], length: 10, red: null },
              recoveryParam: 0
          }
      }    
  */

  try {
    const receivedTx: ReceivedTx = req.body;

    Wallet.sendTransaction(receivedTx);
  } catch (e) {
    if (e instanceof Error) console.log(e.message);
  }

  res.json({});
});

app.listen(3000, () => {
  console.log('server onload # port: 3000');
  ws.listen();
});
