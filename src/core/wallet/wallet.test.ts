import { randomBytes } from 'crypto';
import elliptic from 'elliptic';
import { SHA256 } from 'crypto-js';

const ec = new elliptic.ec('secp256k1');

describe('지갑 이해하기', () => {
  let privKey: string;
  let pubKey: string;
  let signature: elliptic.ec.Signature;

  it('개인키 생성하기', () => {
    privKey = randomBytes(32).toString('hex');
    console.log('개인키 : ', privKey);
    console.log('길이 : ', privKey.length);
  });

  it('공개키 생성하기', () => {
    const keyPair = ec.keyFromPrivate(privKey);
    pubKey = keyPair.getPublic().encode('hex', true);
    console.log('공개키 : ', pubKey);
    console.log('길이 : ', pubKey.length);
  });

  it('서명 만들기', () => {
    const keyPair = ec.keyFromPrivate(privKey);
    const hash = SHA256('transaction data').toString();

    signature = keyPair.sign(hash, 'hex');
    console.log('서명 : ', signature);
  });

  it('검증하기 (verify)', () => {
    const hash = SHA256('transaction data').toString();
    const verify = ec.verify(hash, signature, ec.keyFromPublic(pubKey, 'hex'));

    console.log(verify);
  });

  it('계정 만들기(지갑 주소)', () => {
    const buffer = Buffer.from(pubKey);
    const address = buffer.slice(26).toString();

    console.log('계정 : ', address);
  });
});
