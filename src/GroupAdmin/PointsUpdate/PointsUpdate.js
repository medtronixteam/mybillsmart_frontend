import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PointsUpdate.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const PointsUpdate = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    levelOnePoints: "",
    levelTwoPoints: "",
    levelThreePoints: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const BASE_URL = "https://bill.medtronix.world";

  // Fetch current points on component mount
  useEffect(() => {
    const fetchCurrentPoints = async () => {
      setIsFetching(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/api/group/referral/points`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const pointsData = response.data.data; // Adjust according to your API response structure

        setFormData({
          levelOnePoints: pointsData.level_1_points || "",
          levelTwoPoints: pointsData.level_2_points || "",
          levelThreePoints: pointsData.level_3_points || "",
        });
      } catch (error) {
        console.error("Error fetching points:", error);
        // toast.error(
        //   error.response?.data?.message ||
        //   error.message ||
        //   "Failed to fetch current points."
        // );
      } finally {
        setIsFetching(false);
      }
    };

    if (token) {
      fetchCurrentPoints();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.levelOnePoints ||
      !formData.levelTwoPoints ||
      !formData.levelThreePoints
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/group/referral/points`,
        {
          level_1_points: Number(formData.levelOnePoints),
          level_2_points: Number(formData.levelTwoPoints),
          level_3_points: Number(formData.levelThreePoints),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Points updated successfully!");
      // Optionally fetch the updated points again
      // Or you can keep the current formData since it was successfully updated
    } catch (error) {
      console.error("Error updating points:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update points. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="PointsUpdate-container">
      <h2 className="text-center">Referral Points Update's</h2>
      {isFetching ? (
        <div className="loading-message">Loading current points...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            name="levelOnePoints"
            placeholder="Level one Points"
            value={formData.levelOnePoints}
            onChange={handleChange}
            required
            min="0"
          />
          <input
            type="number"
            name="levelTwoPoints"
            placeholder="Level Two Points"
            value={formData.levelTwoPoints}
            onChange={handleChange}
            required
            min="0"
          />
          <input
            type="number"
            name="levelThreePoints"
            placeholder="Level Three Points"
            value={formData.levelThreePoints}
            onChange={handleChange}
            required
            min="0"
          />

          <button
            type="submit"
            disabled={isLoading || isFetching}
            className={isLoading ? "loading" : ""}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </form>
      )}
    </div>
  );
};

export default PointsUpdate;
