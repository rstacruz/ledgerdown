Expander = require '../lib/expander'

expect = require('chai').expect
j = JSON.stringify

describe 'Syntax', ->
  describe 'currencies', ->
    before ->
      @parse = (str) =>
        @data = Expander.parse (str)
        @postings = @data[0].postings

    it 'default currency', ->
      @parse 'Jan 24:\n500: Cash to Expenses'
      expect(@postings).eql ['Expenses  $500', 'Cash']

    it 'prefix currency', ->
      @parse 'Jan 24:\nAU$ 500: Cash to Expenses'
      expect(@postings).eql ['Expenses  AU$ 500', 'Cash']

    it 'suffix currency', ->
      @parse 'Jan 24:\n500 $: Cash to Expenses'
      expect(@postings).eql ['Expenses  500 $', 'Cash']

  describe 'transactions', ->
    afterEach ->
      expect(j @data).eq j [
        date: "2014/01/24"
        description: "hello"
        postings: [ "Expenses  $500", "Cash" ]
      ]

    it 'default style', ->
      @data = Expander.parse '''
        Jan 24:
        500: Cash to Expenses: hello'''

    it 'with spaces', ->
      @data = Expander.parse '''
        Jan 24:
        500 : Cash to Expenses : hello'''
