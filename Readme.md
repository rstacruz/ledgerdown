Ledgerdown
==========

We love using [ledger-cli] to manage our personal finances, but writing every 
transaction in your life can be painfully cumbersome.

Ledgerdown lets you write your days transactions in a condensed format, and 
outputs it in a ledger.


[![Status](http://img.shields.io/travis/rstacruz/ledgerdown/master.svg?style=flat)](https://travis-ci.org/rstacruz/ledgerdown 
"See test builds")

My suggestion: use a Dropbox-powered text editor in your phone to write your 
ledgerdown files. They'll look like this:

```yaml
Jan 12:
35: Cash to Snacks: Famous waffles
55: Cash to Snacks: Chicken Wraps
4000: Savings to Cash: Withdraw
4000 = Cash balance
* ATM withdrawal
  Expenses:Fees 11, Cash 2000, Savings
```

Then run *Ledgerdown* when you get home, to get this output:

```sh
2014/01/12 * Famous waffles
  Snacks              $35
  Cash

2014/01/12 * Chicken Wraps
  Snacks              $55
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
$ npm install -g rstacruz/ledgerdown
```

## Usage

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

#### Transaction

```sh
AMOUNT ":" FROM "to" TO ":" [DESCRIPTION] ["@" DATE]
```

Transfers `AMOUNT` from two accounts. The dash, colon, and commas are optional 
and are allowed for readability.

You may also specify a `DATE`. This date is optional; the parser will remember 
whatever was the last date read and use that when there's no date.

Examples:

    300: Cash to Expenses
    300: Cash to Expenses: Pay for goods
    500: Income:Other to Savings: Gift from Jen @ jan 20

Output:

    2014/01/01 * Pay for goods
      Expenses             $300
      Cash

    2014/01/01 * Buffalo chicken tacos
      Snacks               $300
      Cash

    2014/01/20 * Gift from Jen
      Savings              $500
      Income:Other

#### Date heading

    [YEAR] MONTH DAY ":"

Sets the last date to the given day. This makes the next date-less transactions 
use the last remembered day.

Examples:

    Jan 24:
    400: Cash to Expenses: Gift for Jack
    220: Cash to Expenses: Lunch with Ava

#### Balance assertion

```sh
AMOUNT "=" ACCOUNT "balance" [@ "DATE"]
```

Examples:

    4050 = Savings balance

Output:

    2014/01/01 * Savings balance
      [Savings]          = $4050

#### Balance adjustment

```sh
AMOUNT "=" ACCOUNT "balance (via" ADJUSTMENT ")" ["@" DATE]
```

Transfers money from the `:adjustment` account to `:account` so that the amount 
of `:account` is exactly `:amount`.

Examples:

    4050 = Savings balance (via Adjustments)

Output:

    2014/01/01 * Savings balance
      Savings            = $4050
      Adjustments

#### Custom transactions

Note: this will be finalized better in the next version

```sh
"+" DESCRIPTION
   POSTING[" / " POSTING2 " / " ... POSTINGn]
   [POSTINGn]

You can join multiple postings in one line by commas. Be sure to indent the 
second.

Postings can be in a simple format, or a format understood by ledger-cli. When 
it's in ledger-cli format, it will be included in verbatim. The simple version 
is as follows:

```sh
AMOUNT ": " ACCOUNT
```

Simple format example:

    + ATM Withdrawal
      0.04: Fees / 200: Cash / Savings

Another example:

    + ATM Withdrawal
      0.04: Fees
      200: Cash
      Savings

ledger-cli format is any posting that doesn't match the simple style.  Remember 
to always use at least two spaces to separate the account and the amount. (Note: 
    default currencies will not work here.)

    + ATM Withdrawal
      Fees   $0.04
      Cash   $200
      Savings

## Sample setup

Makefile:

    all: update report

    update: 2014.ledger current.ledger

    %.ledger: %.txt
      cat $^ | ledgerdown > $@

    report:
      ledger -f .ledger bal

.ledger:

    ; use this file to bind together all your ledger files.
    import common.ledger
    import 2014.ledger
    import current.ledger

2014.txt:

    ; move your old entries to this file.
    ; it will automatically generate `2014.ledger`.

current.txt:

    ; put new entries here.
    ; it will automatically generate `current.ledger`.

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
