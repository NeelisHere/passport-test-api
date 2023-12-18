const isAuthenticated = (req, res, next) => {
    if (req.user) {
        next()
    } else {
        res.json({
            success: false,
            message: 'Not logged in!'
        })
    }
}

module.exports = isAuthenticated