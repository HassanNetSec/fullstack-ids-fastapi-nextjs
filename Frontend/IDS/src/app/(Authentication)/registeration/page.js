"use client";
import React from "react";
import axios from "axios";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Registration = () => {
  const router = useRouter(); // For navigation after successful registration

  // Validation Function
  const validate = (values) => {
    const errors = {};

    if (!values.username) {
      errors.username = "Please enter your username.";
    } else if (values.username.length > 15) {
      errors.username = "Username must be 15 characters or fewer.";
    }

    if (!values.email) {
      errors.email = "Email is required.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = "Invalid email address.";
    }

    if (!values.password) {
      errors.password = "Password is required.";
    } else if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
  };

  // Formik Configuration
  // Formik Configuration
  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await axios.post("http://localhost:8000/register", {
          username: values.username,
          email: values.email,
          password: values.password,
        });

        if (response.status === 200) {
          console.log("✅ Registration Successful!");
          resetForm(); // Reset the form after successful submission
          router.push("/login"); // Redirect to login page
        } else {
          alert(f`⚠️ Unexpected response: ${response.status} and details :  ${response?.data?.detail?.message}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          alert(`❌ Error: ${error.response?.data?.detail?.message || "Registration failed"}`);
        } else {
          alert("⚠️ An unexpected error occurred.");
        }
      } finally {
        setSubmitting(false); // Ensure form submission state resets
      }
    },
  });
  return (
    <div className="max-w-4xl max-sm:max-w-lg mx-auto p-6 mt-6">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Intrusion Detection System</h1>
        <p className="text-slate-600 text-base mt-2">Register for access</p>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid sm:grid-cols-2 gap-8">
          {[
            { label: "Username", name: "username", type: "text", placeholder: "Enter your username" },
            { label: "Email", name: "email", type: "text", placeholder: "Enter your email" },
            { label: "Password", name: "password", type: "password", placeholder: "Enter your password" },
            { label: "Confirm Password", name: "confirmPassword", type: "password", placeholder: "Confirm your password" },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-slate-800 text-sm font-medium mb-2 block">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values[field.name]}
                className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all"
                placeholder={field.placeholder}
              />
              {formik.touched[field.name] && formik.errors[field.name] && (
                <div className="text-red-500 text-xs mt-1">{formik.errors[field.name]}</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mx-auto block py-3 px-6 text-sm font-medium tracking-wider rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
          >
            {formik.isSubmitting ? "Registering..." : "Register"}
          </button>
        </div>
      </form>

      <p className="text-center text-gray-600 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Registration;
