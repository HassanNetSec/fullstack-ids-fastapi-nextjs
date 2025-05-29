'use client'
import React from 'react'
import Link from 'next/link';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Login = () => {
  const router = useRouter();

  // Formik Validation
  const validate = (values) => {
    const errors = {};

    if (!values.email) {
      errors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
    ) {
      errors.email = "Invalid email address.";
    }

    if (!values.password) {
      errors.password = "Password is required.";
    } else if (values.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    return errors;
  };

  // Formik Configuration
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await axios.post("http://localhost:8000/login", {
          email: values.email,
          password: values.password,
        });

        if (response.status === 200) {
          console.log("User Successfully Logged In");
          const token_id= response.data.token
          localStorage.setItem("token",token_id)
          resetForm();
          router.push("/MainApp/dashboard"); // Redirect to homepage
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          alert(`❌ Error: ${error.response?.data?.detail || error.response?.data || "Login failed"}`);
        } else {
          alert("⚠️ An unexpected error occurred.");
          console.error(error);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="max-w-4xl max-sm:max-w-lg mx-auto p-6 mt-6">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Intrusion Detection System
        </h1>
        <p className="text-slate-600 text-base mt-2">
          Login to access your dashboard and manage your intrusion detection system securely.
        </p>

      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid sm:grid-row-2 gap-8">
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">
              Email
            </label>
            <input
              name="email"
              type="email"  // FIX: Change from text to email
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Enter your email"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Enter your password"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <button
            type="submit"
            className="mx-auto block py-3 px-6 text-sm font-medium tracking-wider rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
            disabled={formik.isSubmitting} // Optional: Disable button while submitting
          >
            {formik.isSubmitting ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>

      <p className="text-center text-gray-600 mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/registeration" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
