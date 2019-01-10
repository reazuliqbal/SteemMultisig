const dsteem = require('dsteem');
const utils = require('./utils');

const output = $('#output');

const client = new dsteem.Client('https://api.steemit.com');

$(document).ready(async () => {
  $('#transaction').change(async () => {
    const transaction = $('#transaction').val();
    const operations = $('#operations');
    const signers = $('#signers');
    const signed = $('#signed');

    operations.empty();
    signers.empty();
    signed.empty();

    // Parsing provided transaction and determining who signed and who can sign.
    if (transaction !== '') {
      const trx = JSON.parse(transaction);

      if (trx.operations.length > 0) {
        const msg = utils.parseOperations(trx.operations);

        operations.append(`<p class="text-secondary">${msg.join('<br>')}</p>`);
      }

      const potentialSigners = await client.database.call('get_potential_signatures', [trx]);

      if (potentialSigners.length > 0) {
        potentialSigners.forEach((k) => {
          signers.append(`<p class="text-info">${k}</p>`);
        });
      }

      if (trx.signatures.length > 0) {
        const keys = utils.getSigners(trx);

        signed.append(`<p class="text-success">${keys.join('<br>')}</p>`);
      }
    }
  });

  // Signing the transaction with the provided WIP
  $('#sign-transaction').submit(async (event) => {
    const transaction = $('#transaction').val();
    const wif = $('input[name="wif"]').val();

    // Reseting output
    output.val('');

    if (transaction !== '') {
      const trx = JSON.parse(transaction);

      const signed = client.broadcast.sign(trx, dsteem.PrivateKey.from(wif));
      output.val(JSON.stringify(signed, null, 4));
    }
    event.preventDefault();
  });
});
