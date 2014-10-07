---
title: Syntax reference
---

## Transaction

```sh
AMOUNT ":" FROM "to" ACCOUNT [":" DESCRIPTION] ["@" DATE]
```

Transfers `AMOUNT` from two accounts.

When the amount does not have any currency symbol, it's assumed to be the 
default currency (`$` by default).

You may also specify a `DATE`. This date is optional; the parser will remember 
whatever was the last date read and use that when there's no date.

Transactions are considered cleared (`*`) by default.

Examples:

    300: Cash to Expenses
    300: Cash to Expenses: Pay for goods
    500: Income:Other to Savings: Gift from Jen @ jan 20
    BTC 0.052: Assets:Bitcoin to Expenses: Payment

Output:

    2014/01/01 * Pay for goods
      Expenses                $300
      Cash

    2014/01/01 * Buffalo chicken tacos
      Snacks                  $300
      Cash

    2014/01/20 * Gift from Jen
      Savings                 $500
      Income:Other

    2014/01/20 * Payment
      Expenses           BTC 0.052
      Assets:Bitcoin

## Date heading

``` sh
[YEAR] MONTH DAY ":"
```

Sets the last date to the given day. This makes the next date-less transactions
use the last remembered day.

If a `YEAR` is not specified, it'll use the year of the last transaction 
recorded, or the current year otherwise.

#### Example

    Jan 24:
    400: Cash to Expenses: Gift for Jack
    220: Cash to Expenses: Lunch with Ava

## Balance assertion

```sh
AMOUNT "=" ACCOUNT "balance" [":" DESCRIPTION] ["@" DATE]
```

Asserts that the given `ACCOUNT` has a specific balance.

#### Example

    4050 = Savings balance

Output:

    2014/01/01 * Savings balance
      [Savings]          = $4050

#### Example with description

    0 = Cash balance: wallet emptied

Output:

    2014/01/01 * wallet emptied
      [Savings]          = $0

#### See also

* http://www.ledger-cli.org/3.0/doc/ledger3.html#Balance-assertions

## Balance assignment

```sh
AMOUNT "=" ACCOUNT "balance (via" ADJUSTMENT ")" ["@" DATE]
```

NOTE: this is likely to be deprecated.

Transfers money from the `:adjustment` account to `:account` so that the amount 
of `:account` is exactly `:amount`.

Examples:

    4050 = Savings balance (via Adjustments)

Output:

    2014/01/01 * Savings balance
      Savings            = $4050
      Adjustments

## Custom transactions

Note: this will be finalized better in the next version.

```sh
"+" DESCRIPTION
   POSTING[", " POSTING2 ", " ... POSTINGn]
   [POSTINGn]
 ```

You can join multiple postings in one line by slashes. Be sure to indent the 
second.

Postings can be in a simple format, or a format understood by ledger-cli. When 
it's in ledger-cli format, it will be included in verbatim. The simple version 
is as follows:

```sh
AMOUNT ": " ACCOUNT
```

#### Simple format example

    + ATM Withdrawal
      0.04: Fees, 200: Cash, Savings

#### Another example

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

Raw data
--------

``` sh
"~~~"
RAWDATA
"~~~"
```

Anything in between `~~~` are passed through without any pre-processing. This
allows you to include ledger commands that ledgerdown does not support.

#### Example

    ~~~
    alias L = Liabilities
    ~~~

    500: L:Bank to Cash: Bank loan

Comments
--------

``` sh
";" COMMENT
```

Comments begin with `;`, just as they do in ledger-cli.

#### Example

```
; unsure about this amount
50.23: Credit Card to Misc: books
```

#### See also

* http://www.ledger-cli.org/3.0/doc/ledger3.html#Commenting-on-your-Journal

References
----------

 * http://www.ledger-cli.org/3.0/doc/ledger3.html
