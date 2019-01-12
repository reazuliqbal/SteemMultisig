# SteemMultisig
Steem Multiple Authority Manager is a web interface for adding multiple signatory authority to a Steem account, creating, signing, and broadcasting transactions from that account.

## Web: https://codebull.github.io/SteemMultisig/

## Features

- Changing a Steem account's role(s)' authority to multi-signatory authority
- Creating a signed transaction. Currently - `transfer`, `transfer_to_vesting`, `withdraw_vesting`, `delegate_vesting_shares`, and `account_witness_vote`.
- Signing already created transaction.
- Broadcasting the signed transaction.

## How does it work?

When a user visits the webpage it checks if the user had [logged in before](https://github.com/CodeBull/SteemMultisig/blob/master/src/app.js#L20-L31) if not ask them to [login](https://github.com/CodeBull/SteemMultisig/blob/master/src/app.js#L37-L58). Then it saves logged-in user's data to the browser's localStorage for auto-filling forms and account update data.

The logged-in user now can generate [multiple authority](https://github.com/CodeBull/SteemMultisig/blob/master/src/app.js#L68-L139) for posting, active, or owner role of his/her account.

If he/she has multiple authority already setup, can head over to [transaction generation](https://codebull.github.io/SteemMultisig/generate-transaction.html) page and generate a [signed transaction](https://github.com/CodeBull/SteemMultisig/blob/master/src/gen-transaction.js#L20-L104) with a private key. The signed transaction has 1 hour expiration time.

The signed transaction can now be sent to other keys (authority) holders for signing. They can use [sign transaction](https://codebull.github.io/SteemMultisig/sign-transaction.html) page to [sign](https://github.com/CodeBull/SteemMultisig/blob/master/src/sign-transaction.js#L46-L60) the transaction with their key. After inputting JSON transaction data the interface will show who [can sign and who already signed](https://github.com/CodeBull/SteemMultisig/blob/master/src/sign-transaction.js#L9-L42).

After signed by all required parties, the signed transaction can be [broadcasted](https://github.com/CodeBull/SteemMultisig/blob/master/src/broadcast-transaction.js#L8-L29) from [broadcast transaction page](https://codebull.github.io/SteemMultisig/broadcast-transaction.html) to the blockchain.

## How to use?

### Step 1: Login

Log in with your Steem username. After successful login, you can use all the pages. Login is required to save your Steem username, memo key to be used in account updates and auto-filling forms.

### Step 2: Generating Multiple Authority

You now can make your steem account a multiple signatory accounts for all roles. Select your desired Authority role from the dropdown, add the public key(s) and/or account(s) and desired weight for the key(s) and account(s). If you need to generate key(s), use the form at the bottom of the page.


<center>https://cdn.steemitimages.com/DQmPPhkRGo5Td4NQGJ3n1d8ywNHyJtLbGNjpWMaM4DSgNma/3_adding-multi-auth.png</center>

Enter weight threshold for broadcasting any transaction. Weight threshold is the minimum required total weight of the keys that signed a transaction before it can be broadcasted to the blockchain. In the example, weight threshold is set at 100, so before broadcasting a transaction from @projectaccount that requires `active` authority, all key that signed the transaction should have a total weight of 100 or more.

So, in the example, the private key of public key 1 (weight 50) and 2 (weight 30) is always required, and then @projectaccount can use the private key of any of the key 3 or 4, or account @reazuliqbal or @bdcommunity to sign and broadcast a successful transaction.

Here is our example [transaction](https://steemd.com/tx/9f8ce46d886db4db14cc7891d0c7bf91d48eb09a) on the blockchain.

### Step 3: Generating Transaction

Generate a transaction for supported operation (more will come) from [generate transaction](https://codebull.github.io/SteemMultisig/generate-transaction.html) page with your private key.

Select an operation from the dropdown and fill out the form, enter your private key and click Generate. Copy the generated JSON form of the transaction and send it to other parties for signing.

<center>https://cdn.steemitimages.com/DQmPMLD26DodSfVyLsZoh4EivjfnLWiiv2MhvWfgKtHeoqx/4_generating-transaction.png</center>

In the example, @projectaccount is sending 1 STEEM to @reazuliqbal.

### Step 4: Signing Transaction

If you are one of the other parties, you should use the [transaction signing](https://codebull.github.io/SteemMultisig/sign-transaction.html) page to sign the transaction.

<center>https://cdn.steemitimages.com/DQmTV5hYFtHGkA8L5T1ERTdcfzp7gWPfxSQdkgvnwQU5UmC/5_signing-transaction.png</center>

Paste the JSON transaction data. You'll see who already signed and who can sign the transaction. Enter your private key and click sign. Copy the signed transaction.

If the weight threshold is met, you can broadcast the transaction or send it to other parties for signing.

### Step 5: Broadcasting Transaction

After signing by all the parties or reaching to weight threshold, you can broadcast the transaction from [broadcast transaction](https://codebull.github.io/SteemMultisig/broadcast-transaction.html) page.

<center>https://cdn.steemitimages.com/DQmRN8GhaHmPcgWnodY43goUw4NauP7RWCerwK9XU8Y6fx3/6_broadcast.png</center>

Paste the signed transaction and click broadcast. If it is successful you'll see a success message else check browser console for errors.

Here is our [example transaction](https://steemd.com/tx/1172fd35170834cc3e7a20c2d8834ada728a62b1) on the blockchain.

## Alternatives

- [msteem - Multisignature transaction app](https://steemit.com/steem/@jga/msteem-multisignature-transaction-app) - Web
- [Steem Multi-Signature Transaction Guide for Beem/Python](https://steemit.com/utopian-io/@crokkon/steem-multi-signature-transaction-guide-for-beem-python-1546636997324) - Python
- [How to set up and use multisignature accounts on Steem Blockchain.](https://steemit.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain) - Node JS

## Technologies

The dSteem library is used to communicate with the Steem blockchain, jQuery for DOM manipulation, Bootstrap 4 for styling, and browserify for compiling for the browser.

Steem.js's auth module was used to sign [changing to multiple authority](https://github.com/CodeBull/SteemMultisig/blob/master/src/app.js#L121) transactions. I was having a problem with broadcasting the multiple authority transactions signed by dSteem, but after trying Steem.js it worked. I was not able to pinpoint where the problem was but it was in the signature.

## TODO

- Support for more operations.
- Adding reset authorities features.
- Adding summary description for operations from JSON.

## Contributing

Feel free to fork the repo and submit a pull request. All sources are included in the /src folder.

To compile:

`npm run build`

To watch your change(s):

`npm run watch`
