import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login-signup.css";

function Login() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        setServerError("");

        try {
            await login(
                data.email,
                data.password
            );

            navigate("/");

        } catch (error) {
            setServerError(error.message);
        }
    };

    return (
        <>
            <h2>Login To Your Account</h2>

            <form
                className="form"
                onSubmit={handleSubmit(onSubmit)}
            >
                <input
                    type="email"
                    {...register("email", {
                        required: "Email is mandatory"
                    })}
                    placeholder="Email"
                    autoComplete="email"
                />

                {errors.email && (
                    <span style={{ color: "red" }}>
                        {errors.email.message}
                    </span>
                )}

                <input
                    type="password"
                    {...register("password", {
                        required: "Password is mandatory"
                    })}
                    placeholder="Password"
                    autoComplete="current-password"
                />

                {errors.password && (
                    <span style={{ color: "red" }}>
                        {errors.password.message}
                    </span>
                )}

                {serverError && (
                    <span role="alert" style={{ color: "red" }}>
                        {serverError}
                    </span>
                )}

                <input
                    type="submit"
                    value={
                        isSubmitting
                            ? "Logging In..."
                            : "Login"
                    }
                    disabled={isSubmitting || loading }
                    style={{ backgroundColor: "#a1eafb" }}
                />
            </form>

            <p>
                Don't have an account? Sign up{" "}
                <Link to="/signup" className="underline">
                    here
                </Link>
            </p>
        </>
    );
}

export default Login;