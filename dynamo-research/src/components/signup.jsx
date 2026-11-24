import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import "../styles/login-signup.css";

function Register() {
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
            await registerUser(
                data.username,
                data.email,
                data.password
            );

            navigate("/login");

        } catch (error) {
            setServerError(error.message);
        }
    };

    return (
        <>
            <h2>Registration Form</h2>

            <form
                className="form"
                onSubmit={handleSubmit(onSubmit)}
            >
                <input
                    type="text"
                    {...register("username", {
                        required: "Username is mandatory",
                        minLength: {
                            value: 3,
                            message: "Minimum 3 characters"
                        },
                        maxLength: {
                            value: 30,
                            message: "Maximum 30 characters"
                        },
                        pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message: "Use letters, numbers, and underscores"
                        }
                    })}
                    placeholder="Username"
                    autoComplete="username"
                />

                {errors.username && (
                    <span style={{ color: "red" }}>
                        {errors.username.message}
                    </span>
                )}

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
                        required: "Password is mandatory",
                        minLength: {
                            value: 12,
                            message: "Minimum 12 characters"
                        },
                        validate: value =>
                            new TextEncoder().encode(value).length <= 72 ||
                            "Password cannot exceed 72 bytes"
                    })}
                    placeholder="Password"
                    autoComplete="new-password"
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
                            ? "Creating Account..."
                            : "Register"
                    }
                    disabled={isSubmitting}
                    style={{ backgroundColor: "#a1eafb" }}
                />
            </form>

            <p>
                Already have an account? Login{" "}
                <Link to="/login" className="underline">
                    here
                </Link>
            </p>
        </>
    );
}

export default Register;