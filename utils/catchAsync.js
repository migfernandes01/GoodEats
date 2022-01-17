//catch async function errors and pass it to the next middleware
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}