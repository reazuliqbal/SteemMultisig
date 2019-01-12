const $ = require('jquery');
const dsteem = require('dsteem');
const { auth } = require('steem');
const regeneratorRuntime = require('regenerator-runtime/runtime');
const { generateTrx } = require('./utils');

// Setting global varables
window.$ = $;
window.jQuery = $;
window.regeneratorRuntime = regeneratorRuntime;

require('./gen-transaction');
require('./sign-transaction');
require('./broadcast-transaction');

const client = new dsteem.Client('https://api.steemit.com');

// Getting user save data from browser's localStorage
// If it exists we go forward and welcome, if not we redirect to homepage
let user = localStorage.getItem('user');

if (user) {
  user = JSON.parse(localStorage.getItem('user'));
  window.user = user;

  $('input[name="username"]').val(user.name);
  $('#welcome').html(`Hello, you are logged in as <span class="text-info">@${user.name}</span>. <a href="#" class="text-danger" id="logout">Logout</a>`);
  $('#login').hide();
} else if (!window.location.pathname.includes('index.html')) {
  document.location.href = './index.html';
}

const feedback = $('#feedback');

$(document).ready(async () => {
  // Processing login - saving user data to localStorage
  $('#login').submit(async (event) => {
    const username = $('#username').val();

    client.database.getAccounts([username])
      .then(([r]) => {
        localStorage.setItem('user', JSON.stringify({
          name: r.name,
          memo: r.memo_key,
          posting_account_auth: r.posting.account_auths,
          active_account_auth: r.active.account_auths,
          owner_account_auth: r.owner.account_auths,
          json_metadata: r.json_metadata,
        }));

        location.reload();
      })
      .catch((e) => {
        console.log(e);
      });

    event.preventDefault();
  });

  // Processing logout - deleting user from localStorage
  $('a#logout').click((event) => {
    localStorage.removeItem('user');
    document.location.href = './index.html';
    event.preventDefault();
  });

  // Generating multiple authority for an account
  $('#gen-multi-auth').submit(async (event) => {
    feedback.removeClass('alert-success').removeClass('alert-danger').empty();

    const type = $('#authority').val();
    const threshold = parseInt($('#threshold').val(), 10);
    const publickeys = $('input[name="publickeys[]"]').map((i, e) => $(e).val()).get();
    const weights = $('input[name="weights[]"]').map((i, e) => parseInt($(e).val(), 10)).get();
    const accounts = $('input[name="accounts[]"]').map((i, e) => $(e).val()).get();
    const accountWeights = $('input[name="account_weights[]"]').map((i, e) => parseInt($(e).val(), 10)).get();
    let wif = $('#wif').val();

    // Matching keys with the respected weights
    const keyAuths = publickeys.map((k, i) => ([k, weights[i]]));

    // Matching accounts with the respected weights
    const accountAuths = accounts.map((k, i) => ([k, accountWeights[i]]));

    const authority = {
      key_auths: keyAuths,
      weight_threshold: threshold,
    };

    // Account update operation data
    const operation = ['account_update', {
      account: user.name,
      memo_key: user.memo,
      json_metadata: user.json_metadata,
    }];

    switch (type) {
      case 'posting':
        authority.account_auths = accountAuths;
        operation[1].posting = authority;
        break;

      case 'active':
        authority.account_auths = accountAuths;
        operation[1].active = authority;
        break;

      case 'owner':
        authority.account_auths = accountAuths;
        operation[1].owner = authority;
        // Generating owner key for owner update
        wif = (dsteem.PrivateKey.fromLogin(user.name, wif, 'owner')).toString();
        break;

      default:
    }

    // Waiting for the transacion to be generated and then sign and broadcast to the chain.
    $.when(generateTrx(client, [operation]))
      .then((trx) => {
        const signedTrx = auth.signTransaction(trx, [wif]);

        client.broadcast.send(signedTrx)
          .then((r) => {
            console.log(r);
            feedback.addClass('alert-success').text('You account authorities have been updated successfully.');
          })
          .catch((e) => {
            console.log(e);
            feedback.addClass('alert-danger').text('We were not able to change your account authorities. Please check browser console for more information.');
          });
      })
      .catch((e) => {
        console.log(e);
        feedback.addClass('alert-danger').text('We were not able to change your account authorities. Please check browser console for more information.');
      });

    event.preventDefault();
  });

  // Adding additional key field on button click
  $('#add-key-field').click((e) => {
    const html = `
    <div class="form-group">
    <div class="row">
    <div class="col-sm-8">
    <label for="publickey">Public Key</label>
    <input type="text" name="publickeys[]" class="form-control" required>
    </div>
    <div class="col-sm-4">
    <label for="weight">Weight</label>
    <input type="number" name="weights[]" class="form-control" min="1" required>
    </div>
    </div>
    </div>`;

    $('#keys').append(html);

    e.preventDefault();
  });

  // Removing additional key field on button click
  $('#remove-key-field').click((e) => {
    const children = $('#keys').children('.form-group');

    if (children.length > 1) {
      children.last().remove();
    }

    e.preventDefault();
  });

  // Adding additional account field on button click
  $('#add-account-field').click((e) => {
    const html = `
    <div class="form-group">
    <div class="row">
    <div class="col-sm-8">
    <label for="accounts">Account</label>
    <input type="text" name="accounts[]" class="form-control">
    </div>
    <div class="col-sm-4">
    <label for="account_weight">Weight</label>
    <input type="number" name="account_weights[]" class="form-control" min="1">
    </div>
    </div>
    </div>`;

    $('#accounts').append(html);

    e.preventDefault();
  });

  // Removing additional key field on button click
  $('#remove-account-field').click((e) => {
    const children = $('#accounts').children('.form-group');

    if (children.length > 1) {
      children.last().remove();
    }

    e.preventDefault();
  });

  // Generating Private and Public key along with seed for the key if none was provided
  $('#gen-key').submit((event) => {
    let seed = $('#seed').val();
    if (seed === '') {
      seed = (Math.random() * 1e32).toString(36).toLocaleUpperCase();
      console.log(seed);
    }

    const key = dsteem.PrivateKey.fromSeed(seed);

    $('#seed').val(seed);
    $('#private-key').val(key.toString());
    $('#public-key').val((key.createPublic()).toString());

    event.preventDefault();
  });
});
