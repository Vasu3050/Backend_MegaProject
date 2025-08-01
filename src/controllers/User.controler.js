import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiRes } from "../utils/ApiRes.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Somthing went wrong while generating ref and access tokens",
    );
  }
};

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
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(501, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiRes(200, createdUser, "User registered successfully"));
});

//input user creidentials
//validate
//check if alrady exixting user or not
//gen a new ref token and allow
//send cookies

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is must");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid pasword");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRes(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully",
      ),
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiRes(201, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const usersRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!usersRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      usersRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (usersRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refresh token expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
    );

    res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiRes(
          201,
          {
            accessToken,
            refreshToken,
          },
          "Access token refrshed successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh Token");
  }
});

const changePassword = asyncHandler ( async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect)
    {
      throw new ApiError(400, "Wrong password" );
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false});
    
    return res.status(200)
    .json(
      new ApiRes(200, {}, "Password Changed successfully")
    );

});

const getCurrentUser = asyncHandler ( async (req, res) => {
      return res.status(200)
      .json(
        200, req.user, "Current user fetched successfully"
      );
});

const updateAccountDetails = asyncHandler ( async (req, res) => {
      const {fullname, email} = req.body;

      if ( !fullname || !email)
      {
        throw new ApiError(402,"fullname and email are must to update");
      }

      const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set : {
              fullname : fullname,
              email,
            }
        },
        {
          new : true,
        }
      ).select("-password -refreshToken") 

      return res.status(200)
      .json(
        new ApiRes(200, user, "Account details updated successfully")
      )
});

const updateUserAvatar = asyncHandler (async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if ( !avatarLocalPath )

      {
        throw new ApiError(400, "Avatar file is missing")
      }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if ( !avatar.url )

      {
        throw new ApiError(400, "Error while uploading avatar file")
      }

      const user = await findByIdAndUpdate(
        req.user?._id,
        {
          $set : {
            avatar : avatar.url,
          },
        },
        {
          new: true,
        }
      ).select ("-password -refreshToken")  

      return res.status(200)
      .json(
        new ApiRes(200, {user}, "Img updated successfully")
      )

});

const updateUserCoverImg = asyncHandler (async (req, res) => {
  const coverImgLocalPath = req.file?.path;

  if ( !coverImgLocalPath )

    {
      throw new ApiError(400, "cover image file is missing")
    }

  const coverImg = await uploadOnCloudinary(coverImgLocalPath);

  if ( !coverImg.url )

    {
      throw new ApiError(400, "Error while uploading file")
    }

    await findByIdAndUpdate(
      req.user?._id,
      {
        $set : {
          coverImg : coverImg.url,
        },
      }, 
      {
        new: true,
      }
    ).select ("-password -refreshToken")  

    return res.status(200)
      .json(
        new ApiRes(200, {user}, "Img updated successfully")
      )

});

export { registerUser, loginUser, logOutUser, refreshAccessToken, changePassword, getCurrentUser,
  updateAccountDetails, updateUserAvatar, updateUserCoverImg
 };
