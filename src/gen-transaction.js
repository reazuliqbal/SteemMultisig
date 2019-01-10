const dsteem = require('dsteem');
const { generateTrx } = require('./utils');

const opContainer = $('#operation');
const output = $('#output');

const client = new dsteem.Client('https://api.steemit.com');

// Getting user save data from browser's localStorage
// If it exists we go forward and welcome, if not we redirect to homepage
let user = localStorage.getItem('user');

if (user) {
  user = JSON.parse(localStorage.getItem('user'));

  $('input[name="username"]').val(user.name);
} else if (!window.location.pathname.includes('index.html')) {
  document.location.href = './index.html';
}

$(document).ready(async () => {
  // Geting vest price to convert SP to VESTS
  const vestPrice = dsteem.getVestingSharePrice(await client.database.getDynamicGlobalProperties());

  // Dynamically generating form fields for selected operations
  $('#op_type').change(() => {
    const op = $('#op_type').val();

    if (op === 'vote') {
      opContainer.empty().html(`
      <div class="row form-group">
      <div class="com-sm-2 col-md-4">
      <label>Voter</label>
      <input type="text" name="voter" id="username" class="form-control" value="${user.name}" required>
      </div>
      <div class="com-sm-2 col-md-4">
      <label>Author</label>
      <input type="text" name="author" class="form-control" required>
      </div>
      <div class="com-sm-2 col-md-4">
      <label>Permlink</label>
      <input type="text" name="permlink" class="form-control" required>
      </div>
      <div class="com-sm-2 col-md-4">
      <label>Weight</label>
      <input type="number" name="weight" class="form-control" required>
      </div>
      </div>`);
    }

    if (op === 'transfer') {
      opContainer.empty().html(`
      <div class="row form-group">
      <div class="com-sm-2 col-md-4">
      <label>From</label>
      <input type="text" name="from" class="form-control" value="${user.name}" required>
      </div>
      <div class="com-sm-2 col-md-4">
      <label>To</label>
      <input type="text" name="to" class="form-control" required>
      </div>
      <div class="com-sm-2 col-md-4">
      <label>Amount</label>
      <input type="text" name="amount" class="form-control" placholder="1.0 STEEM" required>
      </div>
      <div class="com-sm-2 col-md-4">
      <label>Memo</label>
      <input type="text" name="memo" class="form-control">
      </div>
      </div>`);
    }

    if (op === 'delegate_vesting_shares') {
      opContainer.empty().html(`
      <div class="row form-group">
      <div class="com-sm-2 col-md-4">
      <label>Delegator</label>
      <input type="text" name="delegator" class="form-control" value="${user.name}" required>
      </div>
      <div class="com-sm-2 col-md-4">
      <label>Delegatee</label>
      <input type="text" name="delegatee" class="form-control" required>
      </div>
      <div class="com-sm-2 col-md-4">
      <label>Steem Power</label>
      <input type="number" name="sp" class="form-control" required>
      </div>
      </div>`);
    }
  });

  $('#generate-transaction').submit(async (event) => {
    const opType = $('#op_type').val();
    const wif = $('input[name="wif"]').val();
    let op = [];

    // Resetting output
    output.val('');

    // Generating operation object for selected operation
    if (opType === 'vote') {
      const voter = $('input[name="voter"]').val();
      const author = $('input[name="author"]').val();
      const permlink = $('input[name="permlink"]').val();
      const weight = parseInt($('input[name="weight"]').val(), 10);

      op = ['vote', {
        voter,
        author,
        permlink,
        weight,
      }];
    }

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

    // Waiting for the transacion to be generated and then sign and output to JSON to the textbox.
    $.when(generateTrx(client, [op])).then((trx) => {
      const signed = client.broadcast.sign(trx, dsteem.PrivateKey.from(wif));
      output.val(JSON.stringify(signed, null, 4));
    })
      .catch(e => console.log(e));

    event.preventDefault();
  });
});
