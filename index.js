var Matcher = require('./lib/matcher');
var Moment = require('moment');

var matcher = new Matcher({
  options: { trim: true },
  dateHeading: '%{date}:',
  date: '%{month} %{number}\\s*%{dayOfWeek}?',
  transaction: '%{amount}\\s*-? %{from:account} > %{to:account}( %{description:str})?',
  nullTransaction: '%{str}\\*\\s*-? %{description:str}',
  balanceAssert: '%{amount} = %{account} balance',
  balanceAssign: '%{amount} = %{account} balance \\(via %{adjustment:account}\\)',
  note: ' ;\\s*%{note:str}',
  postingLine: ' %{posting}',
  postings: { many: 'posting', separator: /, +/ },
  posting: '%{account:str}( %{amount})?',
  month: /[A-Za-z]{3,}/,
  amount: /[\+\-]?\d+(\.\d+)?/,
  number: /\d+/,
  account: /[A-Za-z]+/,
  dayOfWeek: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/,
  str: '.*?'
});

var Expander = {
  options: { 
    defaultCurrency: null
  },

  parseDate: function (str) {
    str = str.replace(/\s+(sun|mon|tue|wed|thu|fri|sat)$/i, '');
    var m = Moment(str);

    // Defaults to 2001 for some reason?
    if (m.year() === 2001) m.year(Moment().year());

    return m && m.format('YYYY/MM/DD');
  },

  parse: function (str) {
    var xp = this;
    var re = [];
    var date = null;
    var last;
    var matched;

    // Currency helper
    var curr = this.toCurrency.bind(this);

    str.split("\n").forEach(function (line) {
      matched = true;

      matcher.switch(line, {
        dateHeading: function (m) {
          date = xp.parseDate(m.date);
        },

        transaction: function (m) {
          if (!date) return;
          re.push({
            date: date,
            description: m.description || m.to,
            postings: [ m.to + "  " + curr(m.amount), m.from ]
          });
        },

        note: function (m) {
          if (!last) return;
          last.postings.push("; "+m.note);
        },

        postingLine: function(m) {
          if (!last) return;

          if (m.amount)
            last.postings.push(m.account + "  " + curr(m.amount));
          else
            last.postings.push(m.account);
        },

        balanceAssert: function (m) {
          if (!date) return;
          re.push({
            date: date,
            description: m.account + " balance",
            postings: [ m.account + "  = " + curr(m.amount) ]
          });
        },

        nullTransaction: function (m) {
          if (!date) return;
          re.push({
            date: date,
            description: m.description
          });
        },

        else: function () {
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
    var format = this.options.defaultCurrency;

    return format ? format.replace("%s", amount) : amount;
  },

};

module.exports = Expander;

