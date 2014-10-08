## v0.3.0 - October  8, 2014

* Add raw support (`~~~`).

* Deprecate `>` and `into`.

* Support many other currency symbols, like £ and €.

* Allow balance assertion with descriptions.

* Fix bug where amounts with commas don't apply currencies.

* Publish to npm.

## v0.2.0 - October 5, 2014

This release refines the syntax and implements errors.

* BREAKING: transaction syntax is now restricted to `amount: account to account: 
description`, where separators are mandatory and only `:` is allowed.

* Other currencies are now supported. eg: `BTC 0.003: Income:Misc to Savings`

* Lines starting with `;` are now treated as comments.

* Errors are now shown in stderr.

* Support the syntax `ledgerdown [file]`.

## v0.1.0 - June 3, 2014

* Initial release.
