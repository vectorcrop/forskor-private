const mongoClient = require("mongodb").MongoClient;

const state = {
  db: null,
};

module.exports.connect = function (done) {
  const url =
        "mongodb+srv://forskor:forskor.com001@forskor.vs3wn9x.mongodb.net/?retryWrites=true&w=majority";
//     "mongodb+srv://msb:msb.com001@cluster0.vtkzb9y.mongodb.net/cluster0?retryWrites=true&w=majority";
  const dbname = "forskor";

  mongoClient.connect(url, { useUnifiedTopology: true }, (err, data) => {
    if (err) {
      return done(err);
    }
    state.db = data.db(dbname);

    done();
  });
};

module.exports.get = function () {
  return state.db;
};
