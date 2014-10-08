Ledgerdown
==========

We love using [ledger-cli] to manage our personal finances, but writing every 
transaction in your life can be painfully cumbersome. Ledgerdown lets you write 
your days transactions in a condensed format, and outputs it in a ledger.

[![Status](http://img.shields.io/travis/rstacruz/ledgerdown/master.svg?style=flat)](https://travis-ci.org/rstacruz/ledgerdown 
"See test builds")

Use a Dropbox-powered text editor in your phone to write your ledgerdown files.  
They'll look like this:

```yaml
Jan 12:
35: Cash to Snacks: Famous waffles
4000: Savings to Cash: Withdraw
4000 = Cash balance

+ ATM withdrawal
  11: Expenses:Fees
  2000: Cash
  Savings
```

Then run *Ledgerdown* when you get home, to get this output:

```sh
2014/01/12 * Famous waffles
  Snacks              $35
  Cash

; Descriptions are optional
2014/01/12 * Cash
  Cash              $4000
  Savings

; Balance assertions
2014/01/12 * Cash balance
  [Cash]          = $4000

; Custom postings are supported
2014/01/12 * ATM Withdrawal
  Expenses:Fees       $11
  Cash              $2000
  Savings
```

## Install

```sh
$ npm install -g ledgerdown
```

[![npm version](http://img.shields.io/npm/v/ledgerdown.svg?style=flat)](https://npmjs.org/package/ledgerdown "View this project on npm")

## Usage

Ledgerdown is a CLI tool that takes an input and spits out 
[ledger-cli]-formatted output.

```sh
$ ledgerdown input.txt > output.ledger
```

Options:

```sh
# Default currency format
$ ledgerdown -c "AUD %s" ... > ...
```

Format
------

See [Syntax reference](docs/Syntax.md).

[ledger-cli]: http://ledger-cli.org/

<br>

### Thanks

**ledgerdown** © 2014+, Rico Sta. Cruz. Released under the [MIT] License.<br>
Authored and maintained by Rico Sta. Cruz with help from contributors ([list][contributors]).

> [ricostacruz.com](http://ricostacruz.com) &nbsp;&middot;&nbsp;
> GitHub [@rstacruz](https://github.com/rstacruz) &nbsp;&middot;&nbsp;
> Twitter [@rstacruz](https://twitter.com/rstacruz)

[MIT]: http://mit-license.org/
[contributors]: http://github.com/rstacruz/ledgerdown/contributors
