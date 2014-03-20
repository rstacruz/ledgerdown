Ledgerdown
==========

We love using ledger-cli to manage our personal finances, but writing every 
transaction in your life can be painfully cumbersome.

Ledgerdown lets you write your days transactions in a condensed format, and 
outputs it in a ledger.

My suggestion: use a Dropbox-powered text editor in your phone to write your 
ledgerdown files. They'll look like this:

    Jan 12:
    35    - Cash > Snacks, Famous waffles
    55    - Cash > Snacks, Chicken Wraps
    4000  - Savings > Cash
    4000  - Cash balance
    *     - ATM withdrawal
            Expenses:Fees 11, Cash 2000, Savings

Then run `ledgerdown` when you get home, to get this output:

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

## Usage

    $ ledgerdown < input.txt > output.ledger

Options:

    # Default currency format
      ledgerdown -c "AUD %s" < ... > ...

Format
------

#### Transaction

    :amount [-] :from > :to[:,] [:description] [@ :date]

Transfers `:amount` from two accounts. The dash, colon, and commas are optional 
and are allowed for readability.

You may also specify a `:date`. This date is optional; the parser will remember 
whatever was the last date read and use that when there's no date.

Examples:

    300 - Cash > Expenses Pay for goods

    300 Cash > Snacks, Buffalo chicken tacos

    500 - Income:Other > Savings: Gift from Jen @ jan 20

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

    [:year] :month :day:

Sets the last date to the given day. This makes the next date-less transactions 
use the last remembered day.

Examples:

    Jan 24:
    400   - Cash > Expenses: Gift for Jack
    22    - Cash > Expenses: Lunch with Ava

#### Balance assertion

    :amount [=] :account balance [@ :date]

Examples:

    4050 = Savings balance

Output:

    2014/01/01 * Savings balance
      [Savings]          = $4050

#### Balance adjustment

    :amount [=] :account balance (via :adjustment) [@ :date]

Transfers money from the `:adjustment` account to `:account` so that the amount 
of `:account` is exactly `:amount`.

Examples:

    4050 = Savings balance (via Adjustments)

Output:

    2014/01/01 * Savings balance
      Savings            = $4050
      Adjustments

#### Extra postings

    [:amount]* [-] :description
       :posting[, :posting2, ... postingN]

You can join multiple postings in one line by commas. Be sure to indent the 
second.

The first `:amount` is ignored and is allowed for readability.

Examples:

    *   - ATM Withdrawal
          Fees 0.04, Cash 200, Savings

## Vim

    AddTabularPattern! ledgerdown /\v^\d*\.?\d*\*?\s/l2

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
