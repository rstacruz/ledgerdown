var Matcher = require('./matcher');
var Moment = require('moment');

function s (array) {
  return array.join("\\s*").replace(/ /g, '\\s+');
}

var matcher = new Matcher({
  options: { trim: true },
  dateHeading: s([
    '%{date}', ':'
  ]),

  // date for the date heading
  date: s([
    '(%{year} )?',
    '%{month}', ' ',
    '%{integer}',
    '%{dayOfWeek}?'
  ]),

  // A transaction
  // ("500: X to Y: description @ jan 25")
  transaction: s([
    '%{amount}', ':', ' ',
    '%{from:account}', ' ',
    '%{into}', ' ',
    '%{to:account}',
    '(: %{description:str})?',
    '%{optionalDate}',
  ]),

  // starts a multiple transaction
  nullTransaction: s([
    '[\\+\\*]', '%{description:str}',
  ]),

  // Balance assertion
  // ("500 = Savings balance")
  // ("0 = Cash balance: wallet emptied")
  balanceAssert: s([
    '%{amount}', '=', '%{account}', 'balance',
    "(:", "%{description:str})?",
    '%{optionalDate}',
  ]),

  // Note or comment.
  comment: s([
    ';', '%{str}'
  ]),

  balanceAdjust: s([
    '%{amount}', '=', '%{account}', ' balance', ' \\(via ',
    '%{adjustment:account}', '\\)', '%{optionalDate}',
  ]),

  // Multiple postings
  postingLine: ' %{posting}',
  postings: { many: 'posting', separator: /, +/ },
  // posting: '%{account:str}( %{amount})?',
  posting: s(['(%{amount}:)?', '%{account:str}']),

  // Yeah
  optionalDate: '\\s*(@\\s*%{date:str})?',
  note: ' ;\\s*%{note:str}',
  rawToggle: '~~~',
  amount: '(%{currency}\\s*)?%{numeric}(\\s*%{currency})?',

  // Atomic pieces
  into: 'to',
  month: /[A-Za-z]{3,}/,
  currency: /[^:;\s!*]+/,
  numeric: /[\+\-]?[\d,]+(\.\d+)?/,
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
              description: m.description || (m.account + " balance"),
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
    if (! (/^[\+\-]?[\d,]+(\.\d+)?$/).test(amount)) {
      return amount;
    }
  
    var format = this.options.currencyFormat;
    if (format.indexOf("%s") === -1) format += "%s";

    return format ? format.replace("%s", amount) : amount;
  },

};

module.exports = Expander;
