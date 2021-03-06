Expander = require '../lib/expander'

expect = require('chai').expect
j = JSON.stringify

describe 'expander', ->
  beforeEach ->
    Expander.options.defaultYear = "2014"

  it 'should work', ->
    expect(Expander).be.object

  it 'transaction without description', ->
    data = Expander.parse '''
      Jan 24:
      500: Cash to Expenses'''

    expect(j data).eq j [
      date: "2014/01/24"
      description: "Expenses"
      postings: [ "Expenses  $500", "Cash" ]
    ]

  it 'use "to"', ->
    data = Expander.parse '''500: Cash to Expenses: things @ jan 26'''
    expect(j data[0].postings).eq j [ "Expenses  $500", "Cash" ]

  it 'date with year', ->
    data = Expander.parse '''
      2010 Jan 24:
      500: Cash to Expenses'''

    expect(data[0].date).eq "2010/01/24"

  it 'remembering years', ->
    data = Expander.parse '''
      2010 Jan 24:
      500: Cash to Expenses
      Jan 25:
      500: Expenses to Cash'''

    expect(data[0].date).eq "2010/01/24"
    expect(data[1].date).eq "2010/01/25"

  it 'transaction with description', ->
    data = Expander.parse '''
      Jan 24:
      500: Cash to Expenses: grocery'''

    expect(data[0].description).eq "grocery"

  it 'transaction with comma and description', ->
    data = Expander.parse '''
      Jan 24:
      500: Cash to Expenses: grocery'''

    expect(data[0].description).eq "grocery"

  it 'date with d-o-w', ->
    data = Expander.parse '''
      Jan 24 Wed:
      500: Cash to Expenses'''

    expect(data[0].date).eq "2014/01/24"

  it 'description/note', ->
    data = Expander.parse '''
      Jan 24:
      500: Cash to Expenses
        ; Chicken'''

    expect(j data[0].postings).eq j [ "Expenses  $500", "Cash", "; Chicken" ]

  it 'balance assertion', ->
    data = Expander.parse '''
      Jan 24:
      5000 = Cash balance'''

    expect(data[0].description).eq "Cash balance"
    expect(j data[0].postings).eq j [ "[Cash]  = $5000" ]

  it 'balance adjustment', ->
    data = Expander.parse '''
      Jan 24:
      5000 = Cash balance (via Adjustments)'''

    expect(data[0].description).eq "Cash balance"
    expect(j data[0].postings).eq j [ "Cash  = $5000", "Adjustments" ]

  it 'null transaction without amount', ->
    data = Expander.parse '''
      Jan 24:
      + ATM withdrawal'''

    expect(data[0].postings).be.empty

  xit 'force balance', ->
    data = Expander.parse '''
      Jan 24:
      500 = Cash balance (via Adjustments)'''

  it 'extra posting with amount', ->
    data = Expander.parse '''
      Jan 24:
      500: A to B
        -200: (Budget:Grocery)
    '''

    expect(data[0].postings[2]).eq "(Budget:Grocery)  $-200"

  it 'extra posting without amount', ->
    data = Expander.parse '''
      Jan 24:
      500: A to B
        Assets:Cash
    '''

    expect(data[0].postings[2]).eq "Assets:Cash"

  it "ignore extra posting when there's an extra line", ->
    data = Expander.parse '''
      Jan 24:
      500: A to B

          Assets:Cash
    '''

    expect(data[0].postings).have.length 2

  it 'null transaction', ->
    data = Expander.parse '''
      Jan 24:
      + Withdrawal
    '''

    expect(data[0].date).eq "2014/01/24"
    expect(data[0].description).eq "Withdrawal"
    expect(data[0].postings).be.empty

  it 'null transaction with custom postings', ->
    data = Expander.parse '''
      Jan 24:
      + Withdrawal
        200: Cash
        Savings
    '''

    expect(j data[0].postings).eq j ["Cash  $200", "Savings"]

  it 'multiple custom postings', ->
    data = Expander.parse '''
      Jan 24:
      + Withdrawal
        1000: Cash, -0.23: Fees, Assets:Savings'''

    expect(data[0].postings[0]).eq "Cash  $1000"
    expect(data[0].postings[1]).eq "Fees  $-0.23"
    expect(data[0].postings[2]).eq "Assets:Savings"

  describe 'default currency', ->
    defaultFormat = null

    beforeEach ->
      defaultFormat = Expander.options.currencyFormat
      Expander.options.currencyFormat = 'PHP %s'

    afterEach ->
      Expander.options.currencyFormat = defaultFormat

    it 'transaction', ->
      data = Expander.parse '''
        Jan 24 Wed:
        500: Cash to Expenses'''

      expect(data[0].postings[0]).eq "Expenses  PHP 500"

    it 'balance assertion', ->
      data = Expander.parse '''
        Jan 24:
        5000 = Cash balance'''

      expect(data[0].postings[0]).eq "[Cash]  = PHP 5000"

    it 'extra posting with amount', ->
      data = Expander.parse '''
        Jan 24:
        500: A to B
            -200: (Budget:Grocery)
      '''

      expect(data[0].postings[2]).eq "(Budget:Grocery)  PHP -200"

  it 'multiple transactions', ->
    data = Expander.parse '''
      Jan 2:
      5100 = Bank balance
      100: Income to Bank: salary
    '''

    expect(data).have.length 2

  it 'ignored lines', ->
    data = Expander.parse '''
      Jan 2:
      5100 = Bank balance
      Something
      100: Income to Bank
    '''

    expect(data).have.length 3
    expect(data[1].type).eq 'comment'
    expect(data[1].comment).eq 'ERROR [stdin]:3: parse error: "Something"'

  describe 'inline dates', ->
    it 'inline dates', ->
      data = Expander.parse '500: Cash to Expenses @ feb 20'
      expect(data[0].date).eq "2014/02/20"

    it 'remembering inline dates', ->
      data = Expander.parse '''
        500: Cash to Expenses @ feb 20
        55: Cash to Expenses
      '''

      expect(data[0].date).eq "2014/02/20"
      expect(data[1].date).eq "2014/02/20"
