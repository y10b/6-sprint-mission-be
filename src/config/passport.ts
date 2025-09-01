import passport from "passport";
import jwt from "../middlewares/passport/jwtStrategy";

passport.use("access-token", jwt.accessTokenStrategy);
passport.use("refresh-token", jwt.refreshTokenStrategy);

export default passport;
