Ledgerdown
==========

We love using ledger-cli to manage our personal finances, but writing every 
transaction in your life can be painfully cumbersome.

Ledgerdown lets you write your days transactions in a condensed format, and 
outputs it in a ledger.

My suggestion: use a Dropbox-powered text editor in your phone to write your 
ledgerdown files. They'll look like this:

    Jan 12:
    35    Cash > Snacks, Famous waffles
    55    Cash > Snacks, Chicken Wraps
    4000  Savings > Cash
    4000  Cash balance
    *     ATM withdrawal
          Expenses:Fees 11, Cash 2000, Savings

Then run `ledgerdown` when you get home, to get this output:

    2014/01/12 Famous waffles
      Snacks              $35
      Cash

    2014/01/12 Chicken Wraps
      Snacks              $55
      Cash

    ; Descriptions are optional
    2014/01/12 Cash
      Cash              $4000
      Savings

    ; Balance assertions
    2014/01/12 Cash balance
      [Cash]          = $4000

    ; Custom postings are supported
    2014/01/12 ATM Withdrawal
      Expenses:Fees       $11
      Cash              $2000
      Savings

## Usage

    $ ledgerdown < input.txt > output.ledger

Options:

    # Default currency format
      ledgerdown -c "AUD %s" < ... > ...

Format
------

#### Transaction

    :amount [-] :from > :to[,] [:description] [@ :date]

Examples:

    300 - Cash > Expenses Pay for goods

    300 Cash > Snacks, Buffalo chicken tacos

Output:

    Pay for goods
      Expenses  $300
      Cash

#### Balance assertion

    :amount [=] :account balance [@ :date]

#### Balance adjustment

    :amount [=] :account balance (via :account)

#### Extra postings

    [:amount]* [-] :description
       :posting[, :posting2, ... postingN]

You can join multiple postings in one line by commas. Be sure to indent the 
second.

The first `:amount` is ignored and is allowed for readability.

## TODO

 * Dates
