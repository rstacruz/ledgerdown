Expander = require '../lib/expander'
format = require('../lib/formatter').format
expect = require('chai').expect
year = (new Date()).getFullYear()

describe 'formats', ->
  proc = (str) -> format Expander.parse(str)

  it 'simple', ->
    str = proc """
      Jan 2:
      5100 = Bank balance
      100: Income to Bank: salary
    """

    expect(str).to.eql """
      #{year}/01/02 * Bank balance
        [Bank]                                    = $5100

      #{year}/01/02 * salary
        Bank                                         $100
        Income
    """

  it 'inferred', ->
    str = proc """
      Jan 2:
      100: Cash to Laundry
    """
    expect(str).to.eql """
      #{year}/01/02 * Laundry
        Laundry                                      $100
        Cash
    """

  it 'note', ->
    str = proc """
      Jan 2:
      100: A to B
        ; awesome
    """

    expect(str).to.eql """
      #{year}/01/02 * B
        B                                            $100
        A
        ; awesome
    """

  it 'ignored lines', ->
    str = proc """
      Jan 2:
      Something
    """

    expect(str).to.eql """
      ; [IGNORED] line 2: Something
    """
