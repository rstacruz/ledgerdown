var Matcher = require('./matcher');
var Moment = require('moment');

var matcher = new Matcher({
  options: { trim: true },
  dateHeading: '%{date}:',
  date: '(%{year} )?%{month} %{integer}\\s*%{dayOfWeek}?',
  transaction: '%{amount}\\s*: %{from:account} %{into} %{to:account}\\s*(: %{description:str})?%{optionalDate}',
  nullTransaction: '%{str}?\\*\\s*-? %{description:str}',
  balanceAssert: '%{amount}\\s*= %{account} balance%{optionalDate}',
  balanceAdjust: '%{amount}\\s*= %{account} balance \\(via %{adjustment:account}\\)%{optionalDate}',
  optionalDate: '\\s*(@\\s*%{date:str})?',
  comment: ';\\s?%{str}',
  note: ' ;\\s*%{note:str}',
  into: 'to',
  rawToggle: '~~~',
  postingLine: ' %{posting}',
  postings: { many: 'posting', separator: /, +/ },
  posting: '%{account:str}( %{amount})?',
  amount: '(%{currency}\\s*)?%{numeric}(\\s*%{currency})?',
  month: /[A-Za-z]{3,}/,
  currency: /[A-Za-z\$]+/,
  numeric: /[\+\-]?\d+(\.\d+)?/,
  integer: /\d+/,
  account: /[A-Za-z0-9:\s]+?/,
  dayOfWeek: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/,
  year: /\d\d\d\d/,
  str: '.*?',
});

var Expander = {
  matcher: matcher,

  warnings: [],

  options: { 
    currencyFormat: "$%s",
    defaultYear: Moment().year(),
    filename: '[stdin]',
  },

  parseDate: function (str, year) {
    if (!str) return;

    str = str.replace(/\s+(sun|mon|tue|wed|thu|fri|sat)$/i, '');
    var m = Moment(str);

    // Defaults to 2001 for some reason?
    if (year && m.year() === 2001) m.year(year);

    return m && m.format('YYYY/MM/DD');
  },

  parse: function (str) {
    var xp = this;
    var re = [];
    var date = null;
    var year = this.options.defaultYear;
    var last;
    var matched;
    var mode;
    var rawLines;

    // Currency helper
    var curr = this.toCurrency.bind(this);

    // Helper to parse a date, or remember & return the last one.
    var getDate = function (str) {
      var d = xp.parseDate(str, year);
      if (d) {
        date = d;
        year = Moment(d).year();
      }
      return date;
    };

    str.split("\n").forEach(function (line, i) {
      matched = true;

      if (mode === 'raw') {

        matcher.switch(line, {
          rawToggle: function (m) {
            re.push({
              type: 'raw',
              body: rawLines.join("\n")
            });
            mode = null;
          },
          else: function () {
            rawLines.push(line);
            // push line
          }
        });

      } else {
        matcher.switch(line, {
          rawToggle: function (m) {
            mode = 'raw';
            rawLines = [];
          },

          dateHeading: function (m) {
            date = getDate(m.date);
          },

          transaction: function (m) {
            if (!date && !m.date) return;
            re.push({
              date: getDate(m.date),
              description: m.description || m.to,
              postings: [ m.to + "  " + curr(m.amount), m.from ]
            });
          },

          note: function (m) {
            if (!last || !last.postings) return;
            last.postings.push("; "+m.note);
          },

          postingLine: function (m) {
            if (!last || !last.postings) return;

            var postings = line.trim().split(/,\s+/);
            postings.forEach(function (posting) {
              m = matcher.match('posting', posting);

              if (m.amount)
                last.postings.push(m.account + "  " + curr(m.amount));
              else
                last.postings.push(m.account);
            });
          },

          balanceAssert: function (m) {
            if (!date && !m.date) return;
            re.push({
              date: getDate(m.date),
              description: m.account + " balance",
              postings: [ "[" + m.account + "]  = " + curr(m.amount) ]
            });
          },

          balanceAdjust: function (m) {
            if (!date && !m.date) return;
            re.push({
              date: getDate(m.date),
              description: m.account + " balance",
              postings: [ m.account + "  = " + curr(m.amount), "Adjustments" ]
            });
          },

          nullTransaction: function (m) {
            if (!date && !m.date) return;
            re.push({
              date: getDate(m.date),
              description: m.description,
              postings: []
            });
          },

          comment: function (m) {
            re.push({
              type: 'comment',
              comment: m.str
            });

            matched = false;
          },

          // unmatched
          else: function () {
            if (line.trim().length > 0) {
              var warning =
                '' + this.options.filename + ':' +
                (i+1) + ': ' +
                'parse error: ' +
                JSON.stringify(line);

              this.warnings.push(warning);
              re.push({ type: 'comment', comment: 'ERROR '+warning });
            }
            matched = false;
          }.bind(xp)
        });
      }

      last = matched ? re[re.length-1] : null;
    });

    return re;
  },

  /**
   * Currency helper
   */

  toCurrency: function (amount) {
    // if currency exists, return it
    if (! (/^[\+\-]?\d+(\.\d+)?$/).test(amount)) {
      return amount;
    }
  
    var format = this.options.currencyFormat;
    if (format.indexOf("%s") === -1) format += "%s";

    return format ? format.replace("%s", amount) : amount;
  },

};

module.exports = Expander;
