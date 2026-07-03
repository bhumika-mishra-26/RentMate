const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of these roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

export const authorizeOwner = authorize("OWNER");
export const authorizeTenant = authorize("TENANT");
export const authorizeAdmin = authorize("ADMIN");

export default authorize;