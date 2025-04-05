import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AgentNotifications.css";
const AgentNotifications = () => {
  const [notificationDetail, setnotificationDetail] = useState(false);
  const notifications = [
    { id: 1, message: "Notification_1" },
    { id: 2, message: "Notification_2" },
    { id: 3, message: "Notification_3" },
    { id: 4, message: "Notification_4" },
    { id: 4, message: "Notification_5" },
  ];

  return (
    <div className="container mt-4">
      <h2 className="text-center">Notifications List</h2>
      <div className="card notifications_card">
        <div className="card-body">
          <ul className="list-group list-group-flush">
            {notificationDetail ? (
              <div className="">
                <h3>Notification_1</h3>
                <p>
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book. It has survived not only five centuries, but
                  also the leap into electronic typesetting, remaining
                  essentially unchanged. It was popularised in the 1960s with
                  the release of Letraset sheets containing Lorem Ipsum
                  passages, and more recently with desktop publishing software
                  like Aldus PageMaker including versions of Lorem Ipsum.
                </p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{notification.message}</span>
                    <div className="text-center mt-3">
                      <Link
                        className="btn  see-more-notification mb-0"
                        onClick={() => setnotificationDetail(true)}
                      >
                        View Details
                      </Link>
                    </div>
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AgentNotifications;
