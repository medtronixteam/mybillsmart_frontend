import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PointsUpdate.css";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const PointsUpdate = ({ onAddUser }) => {
 
  return (
    <div className="PointsUpdate-container">
      <h2 className="text-center">Referral Points Update's</h2>
      <form >
        <input type="number" placeholder="Level one Points" />
        <input type="number" placeholder="Level Two Points" />
        <input type="number" placeholder="Level Three Points" />

        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default PointsUpdate;