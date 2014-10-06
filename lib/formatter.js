var indent = '  ';

module.exports = {
  format: function (transactions) {
    var m;
    var sections = transactions.map(function (obj) {
      var lines = [];

      if (obj.comment) {
        lines.push("; " + obj.comment);
      }
      else if (obj.type === 'raw') {
        lines.push(obj.body);
      }
      else {
        lines.push("" + obj.date + " * " + obj.description);
      }

      if (obj.note) {
        lines.push(indent + '; ' + obj.note);
      }

      if (obj.postings) {
        obj.postings.forEach(function (trans) {
          m = trans.match(/  +/);

          if (m) {
            var meatLen = trans.length - m[0].length;
            var padding = Math.max(2, 50 - meatLen);
            trans = trans.replace(/  +/, Array(padding).join(' '));
          }

          lines.push(indent + trans);
        });
      }

      return lines.join("\n");
    });

    return sections.join("\n\n");
  }
};
