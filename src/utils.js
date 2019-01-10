const dsteem = require('dsteem');

// Helper function to parse JSON operation data and output in text
const parseOperations = (operations) => {
  const msg = [];
  operations.forEach((o) => {
    const op = o[0];
    const data = o[1];

    if (op === 'vote') {
      msg.push(`@${data.voter} is voting @${data.author}/${data.permlink} at ${data.weight / 100}% weight`);
    } else if (op === 'transfer') {
      msg.push(`@${data.from} is sending ${data.amount} to @${data.to}`);
    } else if (op === 'delegate_vesting_shares') {
      msg.push(`@${data.delegator} is delegating ${data.vesting_shares} to @${data.delegatee}`);
    } else {
      msg.push(op);
    }
  });

  return msg;
};

// Generating unsigned transaction from provided operations
const generateTrx = async (client, operations) => {
  const props = await client.database.getDynamicGlobalProperties();

  const refBlockNum = props.head_block_number & 0xFFFF;
  const refBlockPrefix = Buffer.from(props.head_block_id, 'hex').readUInt32LE(4);
  const expiration = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, -5);
  const extensions = [];

  const tx = {
    expiration,
    extensions,
    operations,
    ref_block_num: refBlockNum,
    ref_block_prefix: refBlockPrefix,
  };

  return tx;
};

// Returns array of signer who already signed the transaction.
const getSigners = (transaction) => {
  const keys = [];

  transaction.signatures.forEach((s) => {
    const sig = dsteem.Signature.fromString(s);

    const digest = dsteem.cryptoUtils.transactionDigest(transaction);
    const key = (new dsteem.Signature(sig.data, sig.recovery)).recover(digest);

    keys.push(key.toString());
  });

  return keys;
};

module.exports = {
  generateTrx,
  getSigners,
  parseOperations,
};
