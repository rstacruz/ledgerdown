Expander = require '../lib/expander'

expect = require('chai').expect
j = JSON.stringify

describe 'Syntax', ->
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

    it '>', ->
      @data = Expander.parse '''
        Jan 24:
        500: Cash > Expenses: hello'''

    it 'with spaces', ->
      @data = Expander.parse '''
        Jan 24:
        500 : Cash to Expenses : hello'''
