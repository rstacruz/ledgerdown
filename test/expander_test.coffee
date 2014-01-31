Expander = require '../index'
expect = require('chai').expect
year = new Date().getFullYear()
j = JSON.stringify

describe 'expander', ->
  it 'should work', ->
    expect(Expander).be.object

  it 'transaction without description', ->
    data = Expander.parse '''
      Jan 24:
      500 - Cash > Expenses'''

    expect(j data).eq j [
      date: "#{year}/01/24"
      description: "Expenses"
      postings: [ "Expenses  $500", "Cash" ]
    ]

  it 'transaction without dash', ->
    data = Expander.parse '''
      Jan 24:
      500 Cash > Expenses'''

    expect(j data[0].postings).eq j [ "Expenses  $500", "Cash" ]

  it 'transaction with description', ->
    data = Expander.parse '''
      Jan 24:
      500 - Cash > Expenses grocery'''

    expect(data[0].description).eq "grocery"

  it 'date with d-o-w', ->
    data = Expander.parse '''
      Jan 24 Wed:
      500 - Cash > Expenses'''

    expect(data[0].date).eq "2014/01/24"

  it 'description/note', ->
    data = Expander.parse '''
      Jan 24:
      500 - Cash > Expenses
          ; Chicken'''

    expect(j data[0].postings).eq j [ "Expenses  $500", "Cash", "; Chicken" ]

  it 'balance assertion', ->
    data = Expander.parse '''
      Jan 24:
      5000 = Cash balance'''

    expect(data[0].description).eq "Cash balance"
    expect(j data[0].postings).eq j [ "Cash  = $5000" ]

  it 'null transaction', ->
    data = Expander.parse '''
      Jan 24:
      5000 - ATM withdrawal'''

  xit 'force balance', ->
    data = Expander.parse '''
      Jan 24:
      500 = Cash balance (via Adjustments)'''

  it 'extra posting with amount', ->
    data = Expander.parse '''
      Jan 24:
      500 - A > B
          (Budget:Grocery) -200
    '''

    expect(data[0].postings[2]).eq "(Budget:Grocery)  $-200"

  it 'extra posting without amount', ->
    data = Expander.parse '''
      Jan 24:
      500 - A > B
          Assets:Cash
    '''

    expect(data[0].postings[2]).eq "Assets:Cash"

  it "ignore extra posting when there's an extra line", ->
    data = Expander.parse '''
      Jan 24:
      500 - A > B

          Assets:Cash
    '''

    expect(data[0].postings).have.length 2

  it 'null transaction', ->
    data = Expander.parse '''
      Jan 24:
      500* - Withdrawal
    '''

    expect(data[0].date).eq "2014/01/24"
    expect(data[0].description).eq "Withdrawal"
    expect(data[0].postings).be.empty

  it 'null transaction with custom postings', ->
    data = Expander.parse '''
      Jan 24:
      200* - Withdrawal
        Cash 200
        Savings
    '''

    expect(j data[0].postings).eq j ["Cash  $200", "Savings"]

  it 'multiple custom postings', ->
    data = Expander.parse '''
      Jan 24:
      500* - Withdrawal
          Cash 1000, Fees -0.23, Assets:Savings'''

    expect(data[0].postings[0]).eq "Cash  $1000"
    expect(data[0].postings[1]).eq "Fees  $-0.23"
    expect(data[0].postings[2]).eq "Assets:Savings"

  describe 'default currency', ->
    beforeEach -> Expander.options.defaultCurrency = 'PHP %s'
    afterEach  -> Expander.options.defaultCurrency = null

    it 'transaction', ->
      data = Expander.parse '''
        Jan 24 Wed:
        500 - Cash > Expenses'''

      expect(data[0].postings[0]).eq "Expenses  PHP 500"

    it 'balance assertion', ->
      data = Expander.parse '''
        Jan 24:
        5000 = Cash balance'''

      expect(data[0].postings[0]).eq "Cash  = PHP 5000"

    it 'extra posting with amount', ->
      data = Expander.parse '''
        Jan 24:
        500 - A > B
            (Budget:Grocery) -200
      '''

      expect(data[0].postings[2]).eq "(Budget:Grocery)  PHP -200"
