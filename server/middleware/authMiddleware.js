export default function isAuthenticated(req, res, next) {
  if (req.session.user && req.session.user.id) {
    return next();
  }
  return res.status(401).send({ message: 'Authentication required.' });
}
