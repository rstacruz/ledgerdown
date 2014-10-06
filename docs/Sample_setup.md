# Sample setup

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
