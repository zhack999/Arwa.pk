import jwt from "jsonwebtoken";

const customerAuthMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.customerToken;

        if (!token) {
            return res.status(401).json({ success: false, message: "Not logged in." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.customer = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired session." });
    }
};

export default customerAuthMiddleware;