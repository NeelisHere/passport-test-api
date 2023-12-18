const checkAuthenticated = (req, res, next) => {
    console.log(`auth middleware: ${req.isAuthenticated()}`)
    if (req.user) {
        next()
    } else {
        res.json({
            success: false,
            message: 'Not logged in!'
        })
    }
}

module.exports = checkAuthenticated 