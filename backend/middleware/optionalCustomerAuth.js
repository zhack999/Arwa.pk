import jwt from "jsonwebtoken";

// Unlike customerAuthMiddleware, this NEVER blocks the request.
// If a valid customer cookie exists, req.customer gets set.
// If not (guest, or expired token), we just continue as a guest checkout.
const optionalCustomerAuth = (req, res, next) => {
    try {
        const token = req.cookies.customerToken;
        if (token) {
            req.customer = jwt.verify(token, process.env.JWT_SECRET);
        }
    } catch (error) {
        // Invalid/expired token — treat as guest, don't block checkout over it
    }
    next();
};

export default optionalCustomerAuth;