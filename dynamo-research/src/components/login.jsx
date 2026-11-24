
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
            await login(data.email, data.password);

            navigate("/home");
        } catch (error) {
            setServerError(error.message);
        }
    };

    return (
        <div className="authPage">
            <header className="authHeader">
                <h1>Dynamo Research</h1>
            </header>

            <div className="authCard">
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
                        value={isSubmitting ? "Logging In..." : "Submit"}
                        disabled={isSubmitting || loading}
                    />
                </form>

                <p>
                    Don't have an account? Sign up{" "}
                    <Link to="/signup" className="underline">
                        here
                    </Link>
                </p>
            </div>
                <div className="authVersion">
                Version 1.1.7
            </div>
        </div>
    );
}

export default Login;
