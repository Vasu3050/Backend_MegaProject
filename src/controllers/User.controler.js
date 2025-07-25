import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiRes } from "../utils/ApiRes.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  if (
    [username, email, fullname, password].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are must");
  }

  console.log(username, email, fullname, password);

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarFile = req.files?.avatar?.[0];
  const coverFile = req.files?.coverImg?.[0];

  if (!avatarFile || !coverFile) {
    throw new ApiError(400, "Cover IMG and Avatar are must");
  }

  const avatarLocalPath = avatarFile.path;
  const coverImgLocalPath = coverFile.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImgLocalPath);

  if (!avatar || !coverImage) {
    throw new ApiError(400, "Cover IMG and Avatar upload failed");
  }

  const user = await User.create({
    fullname: fullname,
    avatar: avatar?.url || "",
    coverImg: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(501, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiRes(200, createdUser, "User registered successfully"));
});

export default registerUser;
