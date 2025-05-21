export const isAuthenticated = (req, res, next) => {
    if (req.session.user && req.session.user.id) {
        return next();
    }
    res.status(401).send({ message: "Authentication required." });
};