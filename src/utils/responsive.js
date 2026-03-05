import { scale, verticalScale, moderateScale } from "react-native-size-matters";

export const ms = (size) => moderateScale(size);
export const hs = (size) => scale(size);           // horizontal scaling
export const vs = (size) => verticalScale(size);   // vertical scaling
