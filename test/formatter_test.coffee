Expander = require '../lib/expander'
format = require('../lib/formatter').format
expect = require('chai').expect
year = (new Date()).getFullYear()

describe 'formats', ->
  proc = (str) ->
    data = Expander.parse(str)
    console.log(data)
    format(data)

  it 'simple', ->
    str = proc """
      Jan 2:
      5100 = Bank balance
      100  - Income > Bank, salary
    """

    expect(str).to.eql """
      #{year}/01/02 * Bank balance
        [Bank]  = $5100

      #{year}/01/02 * salary
        Bank  $100
        Income
    """

  xit 'inferred', ->
    str = proc """
      - 100 .. Cash > Laundry @ jan 3
    """
    expect(str).to.eql """
      #{year}/01/03 * Laundry
        Laundry  100
        Cash
    """

  xit 'note', ->
    str = proc """
      100 A > B @ jun 4
        .. ; awesome
    """

    expect(str).to.eql """
      #{year}/06/04 * B
        B  100
        A
        ; awesome
    """

