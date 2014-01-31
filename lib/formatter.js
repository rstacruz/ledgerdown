var indent = '  ';

module.exports = {
  format: function (transactions) {
    var sections = transactions.map(function (obj) {
      var lines = [];

      if (obj.comment)
        lines.push("; " + obj.comment);

      else {
        lines.push("" + obj.date + " * " + obj.description);
      }

      if (obj.note)
        lines.push(indent + '; ' + obj.note);

      if (obj.postings)
        obj.postings.forEach(function (trans) {
          lines.push(indent + trans);
        });

      return lines.join("\n");
    });

    return sections.join("\n\n");
  }
};
