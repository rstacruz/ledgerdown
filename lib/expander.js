var Matcher = require('./matcher');
var Moment = require('moment');

var matcher = new Matcher({
  options: { trim: true },
  dateHeading: '%{date}:',
  date: '(%{year} )?%{month} %{number}\\s*%{dayOfWeek}?',
  transaction: '%{amount}\\s*-? %{from:account} > %{to:account}\\s*(,? %{description:str})?%{optionalDate}',
  nullTransaction: '%{str}?\\*\\s*-? %{description:str}',
  balanceAssert: '%{amount}\\s*[-=]? %{account} balance',
  balanceAdjust: '%{amount}\\s*[-=]? %{account} balance \\(via %{adjustment:account}\\)',
  optionalDate: '\\s*(@\\s*%{date:str})?',
  note: ' ;\\s*%{note:str}',
  postingLine: ' %{posting}',
  postings: { many: 'posting', separator: /, +/ },
  posting: '%{account:str}( %{amount})?',
  month: /[A-Za-z]{3,}/,
  amount: /[\+\-]?\d+(\.\d+)?/,
  number: /\d+/,
  account: /[A-Za-z:]+/,
  dayOfWeek: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/,
  year: /\d\d\d\d/,
  str: '.*?'
});

var Expander = {
  matcher: matcher,

  options: { 
    currencyFormat: "$%s",
    defaultYear: Moment().year()
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

      matcher.switch(line, {
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
          if (!last) return;
          last.postings.push("; "+m.note);
        },

        postingLine: function (m) {
          if (!last) return;

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

        else: function () {
          if (line.trim().length > 0) {
            re.push({
              type: 'comment',
              comment: '[IGNORED] line '+(i+1)+': ' + line
            });
          }
          matched = false;
        }
      });

      last = matched ? re[re.length-1] : null;
    });

    return re;
  },

  /**
   * Currency helper
   */

  toCurrency: function (amount) {
    var format = this.options.currencyFormat;
    if (format.indexOf("%s") === -1) format += "%s";

    return format ? format.replace("%s", amount) : amount;
  },

};

module.exports = Expander;

