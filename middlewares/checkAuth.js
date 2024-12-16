const jwt = require("jsonwebtoken")

module.exports = async (req, res, next) => {

              try {
                            const token = req.headers.authorization.split(" ")[1]
                            await jwt.verify(token, 'shivam 123')
                            next()


              }
              catch (err) {
                            res.json({
                                          success: false,
                                          message: err.message
                            })
              }
}