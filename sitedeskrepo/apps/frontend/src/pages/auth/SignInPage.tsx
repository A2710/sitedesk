import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignIn } from "../../api/auth.js";
import { userSignin, UserSigninInput } from "@repo/common/types";
import { AuthInput } from "../../components/AuthInput.js";
import { AuthFormWrapper } from "../../components/AuthFormWrapper.js";
import { FormError } from "../../components/FormError.js";

