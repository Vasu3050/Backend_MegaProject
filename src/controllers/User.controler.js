import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import {ApiRes} from "../utils/ApiRes.js";

const registerUser = asyncHandler(async (req, res) => {
  //email
  //password
  //reenter password
  //img
  //name
  //accept terms and conditions
  //details
  //validation
  //check if user already exists
  //check for img,avatar
  //upload to cloudinary
  //create obj of user
  //remove the password from the db respone

  const { username, email, fullname, password } = req.body;
  if (
    [username, email, fullname, password].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are must");
  }

  console.log(username, email, fullname, password);

  const existingUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const imgLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath || !imgLocalPath) {
    throw new ApiError(400, "Cover IMG and Avatar are must");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(imgLocalPath);

  if (!avatar || !coverImage) {
    throw new ApiError(400, "Cover IMG and Avatar are must");
  }

    const user = await User.create({
    fullname: fullname,
    avatar: avatar?.url || "",
    coverImg : coverImage?.url || "",
    email,
    password,
    username : username.toLowerCase(),
  });

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
   );
   if (!createdUser)
   {
        throw new ApiError(501,"Somthing went wrong while regestring the user")
   }

   return res.status(201).json(
     new ApiRes(200, createdUser, "User registered succesfully");)
});

export default registerUser;
