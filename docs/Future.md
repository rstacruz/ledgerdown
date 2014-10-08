---
title: Planned future syntaxes
---

## Tags

This allows things to be searcheable via `ledger r %salad`. The prefix is `#` 
used (since this is what we usually associate with tags), but `%` is accepted 
too (since it's what ledger-cli uses for querying syntax).

```
$23.30: Cash to Dine: Applebee's #salad
```

Output:

```
2014/01/01 * Applebee's
  Dine   $23.30
  Cash
  ; :salad:
```

See: http://ledger-cli.org/3.0/doc/ledger3.html#Metadata-tags

### Pending transactions

```
! $2000: Checking to Rent: Postdated check
```

Output:

```
2014/01/01 ! Postdated check
  Rent       $2000
  Checking
```

See: http://ledger-cli.org/3.0/doc/ledger3.html#State-tags
