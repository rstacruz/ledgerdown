var indent = '  ';

module.exports = {
  format: function (transactions) {
    var sections = transactions.map(function (obj) {
      var desc = obj.description || obj.postings[0][0];
      var lines = ["" + obj.date + " * " + desc];

      if (obj.note)
        lines.push(indent + '; ' + obj.note);

      obj.postings.forEach(function (trans) {
        lines.push(indent + trans);
      });

      return lines.join("\n");
    });

    return sections.join("\n\n");
  }
};
