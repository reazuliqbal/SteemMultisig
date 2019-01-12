const dsteem = require('dsteem');
const { generateHTML, generateTrx } = require('./utils');

const opContainer = $('#operation');
const output = $('#output');

const client = new dsteem.Client('https://api.steemit.com');

$(document).ready(async () => {
  // Geting vest price to convert SP to VESTS
  const vestPrice = dsteem.getVestingSharePrice(await client.database.getDynamicGlobalProperties());

  // Dynamically generating form fields for selected operations
  $('#op_type').change(() => {
    const op = $('#op_type').val();
    opContainer.empty().html(generateHTML(op));
    $('input[name="delegator"], input[name="from"], input[name="account"]').val(window.user.name);
  });

  $('#generate-transaction').submit(async (event) => {
    const opType = $('#op_type').val();
    const wif = $('input[name="wif"]').val();
    let op = [];

    // Resetting output
    output.val('');

    // Generating operation object for selected operation
    if (opType === 'transfer') {
      const from = $('input[name="from"]').val();
      const to = $('input[name="to"]').val();
      const amount = dsteem.Asset.fromString(($('input[name="amount"]').val()).toUpperCase());
      const memo = ($('input[name="memo"]').val());

      op = ['transfer', {
        from,
        to,
        amount,
        memo,
      }];
    }

    if (opType === 'delegate_vesting_shares') {
      const delegator = $('input[name="delegator"]').val();
      const delegatee = $('input[name="delegatee"]').val();
      const sp = parseFloat($('input[name="sp"]').val());
      const vests = vestPrice.convert({ amount: sp, symbol: 'STEEM' });

      op = ['delegate_vesting_shares', {
        delegator,
        delegatee,
        vesting_shares: vests,
      }];
    }

    if (opType === 'transfer_to_vesting') {
      const from = $('input[name="from"]').val();
      const to = $('input[name="to"]').val();
      const amount = dsteem.Asset.fromString(`${$('input[name="amount"]').val()} STEEM`);

      op = ['transfer_to_vesting', {
        from,
        to,
        amount,
      }];
    }

    if (opType === 'withdraw_vesting') {
      const account = $('input[name="account"]').val();
      const sp = $('input[name="sp"]').val();
      const vests = vestPrice.convert({ amount: sp, symbol: 'STEEM' });

      op = ['withdraw_vesting', {
        account,
        vesting_shares: vests,
      }];
    }

    if (opType === 'account_witness_vote') {
      const account = $('input[name="account"]').val();
      const witness = $('input[name="witness"]').val();
      const approveValue = $('input[name="approve"]').val();
      let approve = false;

      if (approveValue === 'yes') {
        approve = true;
      }

      op = ['account_witness_vote', {
        account,
        witness,
        approve,
      }];
    }

    // Waiting for the transacion to be generated and then sign and output to JSON to the textbox.
    $.when(generateTrx(client, [op])).then((trx) => {
      const signed = client.broadcast.sign(trx, dsteem.PrivateKey.from(wif));
      output.val(JSON.stringify(signed, null, 4));
    })
      .catch(e => console.log(e));

    event.preventDefault();
  });
});
