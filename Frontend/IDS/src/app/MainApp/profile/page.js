"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

const UserProfile = () => {
  const [userDetail, setUserDetail] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserDetail = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      try {
        const response = await axios.post("http://localhost:8000/decodeAccessToken", {
          token_id: token,
        });

        if (response.status === 200) {
          const userEmail = response?.data?.message?.key;

          const userDetailResponse = await axios.get(
            `http://localhost:8000/UserDetail?user_email=${userEmail}`
          );

          if (userDetailResponse.status === 200) {
            const { username, email } = userDetailResponse?.data?.data;
            setUserDetail((prev)=>({
              ...prev,username,email
            }))
          } else {
            console.error("Failed to fetch user details");
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetail();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setUserDetail((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await axios.put("http://localhost:8000/EditProfile", {
        username: userDetail.username,
        email: userDetail.email,
        password: userDetail.password,
      });

      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setUserDetail((prev) => ({
          ...prev,
          password: "",
        }));
      } else {
        setSuccess("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSuccess("An error occurred while updating your profile.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await handleProfileUpdate();
    setTimeout(() => {
      setLoading(false);
      setEditing(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 px-6 py-10 bg-white shadow-xl rounded-2xl">
      <h2 className="text-4xl font-bold text-center text-indigo-700 mb-4">Your Profile</h2>

      <p className="text-center text-gray-500 mb-6">
        You can change your <span className="font-medium text-gray-700">username</span> and <span className="font-medium text-gray-700">password</span>.
      </p>

      {success && (
        <div className="text-center text-green-600 font-medium mb-6 transition duration-300">
          {success}
        </div>
      )}

      {!editing && (
        <div className="bg-gray-50 rounded-xl p-6 shadow-inner mb-6">
          <p className="text-lg text-gray-700 mb-4">
            <strong>Name:</strong> {userDetail.username}
          </p>
          <p className="text-lg text-gray-700">
            <strong>Email:</strong> {userDetail.email}
          </p>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-600 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={userDetail.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">
              Email (not editable)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userDetail.email}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-600 mb-2">
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={userDetail.password}
              onChange={handleInputChange}
              placeholder="Leave empty to keep current password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-300"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition duration-300"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
};

export default UserProfile;
