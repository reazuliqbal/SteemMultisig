const dsteem = require('dsteem');

const client = new dsteem.Client('https://api.steemit.com');
const feedback = $('#feedback');

$(document).ready(async () => {
  // Broadcasting signed transaction
  $('#broadcast-transaction').submit(async (event) => {
    const transaction = $('textarea[name="transaction"]').val();
    feedback.empty();

    if (transaction !== '') {
      const trx = JSON.parse(transaction);
      console.log(trx);

      $.when(client.broadcast.send(trx))
        .then((r) => {
          console.log(r);

          feedback.addClass('alert-success').removeClass('alert-danger').append('Transaction has been broadcasted successfully.');
        })
        .catch((e) => {
          console.log(e);
          feedback.addClass('alert-danger').removeClass('alert-success').append('Transaction can not be sent to the blockchain. Please check browser console for more info.');
        });
    }

    event.preventDefault();
  });
});
