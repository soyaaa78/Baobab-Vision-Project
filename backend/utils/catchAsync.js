module.exports = (fn) => {
  return (req, res, next) => {
    // catch async functions
    fn(req, res, next).catch(next);
  };
};
