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
    2000* ATM withdrawal
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

