module.exports = function (req, res, next) {
  res.locals.currentpath = req.path;
  next();
};
