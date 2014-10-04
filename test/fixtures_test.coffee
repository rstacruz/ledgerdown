expect = require('chai').expect
fs = require('fs')

Expander = require('../lib/expander')
format = require('../lib/formatter').format

describe 'fixtures', ->
  fixtures = __dirname + '/../fixtures'

  readdir = (path) ->
    fs.readdirSync(path)
      .filter (dir) ->
        ! dir.match(/^\./)
      .map (dir) ->
        require('path').join(path, dir)

  readdir(fixtures).forEach (dir) ->
    input  = fs.readFileSync(dir + '/in.txt', 'utf-8')
    output = fs.readFileSync(dir + '/out.txt', 'utf-8')

    it "#{dir}/", ->
      out = format(Expander.parse(input))

      try
        expect(out.trim()).eql output.trim()
      catch e
        e.showDiff = false
        throw e
