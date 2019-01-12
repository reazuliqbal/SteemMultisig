const dsteem = require('dsteem');

const ops = {
  // Name Label Type Placeholder/Options Required
  transfer: [
    ['from', 'From', 'text', '', true],
    ['to', 'To', 'text', '', true],
    ['amount', 'Amount', 'text', '1 STEEM', true],
    ['memo', 'Memo', 'text', '', false],
  ],
  delegate_vesting_shares: [
    ['delegator', 'Delegator', 'text', '', true],
    ['delegatee', 'Delegatee', 'text', '', true],
    ['sp', 'Steem Power', 'number', '', true],
  ],
  transfer_to_vesting: [
    ['from', 'From', 'text', '', true],
    ['to', 'To', 'text', '', true],
    ['amount', 'Amount', 'number', '100', true],
  ],
  withdraw_vesting: [
    ['account', 'Account', 'text', '', true],
    ['sp', 'Steem Power', 'number', '100', true],
  ],
  account_witness_vote: [
    ['account', 'Account', 'text', '', true],
    ['witness', 'Witness', 'text', '', true],
    ['approve', 'Approve', 'select', ['Yes', 'No'], true],
  ],
};

const generateHTML = (op) => {
  let html = '<div class="row form-group">';
  ops[op].forEach((e) => {
    html += `<div class="com-sm-2 col-md-4"><label>${e[1]}</label>`;

    if (e[2] === 'text' || e[2] === 'number') {
      html += `<input type="${e[2]}" name="${e[0]}" class="form-control" placeholder="${e[3]}"${(e[4]) ? ' required' : ''}>`;
    } else if (e[2] === 'select') {
      html += `<select name="${e[0]}" class="form-control">`;
      e[3].forEach((v) => {
        html += `<option value="${v.toLowerCase()}">${v}</option>`;
      });
      html += '</select>';
    }

    html += '</div>';
  });

  html += '</div>';

  return html;
};

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
  generateHTML,
  generateTrx,
  getSigners,
  parseOperations,
};
