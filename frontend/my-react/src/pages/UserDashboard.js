import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { issues as allIssues, addIssue, setIssueRating } from "../mockDatabase";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Image, CardText } from "react-bootstrap-icons";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Helper function: Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function UserDashboard({ user }) {
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState("Fetching your location...");
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDetails, setIssueDetails] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [issuePhoto, setIssuePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userCoords = { lat: latitude, lng: longitude };
        setCurrentLocation(userCoords);

        const issuesNearby = allIssues.filter((issue) => {
          const distance = getDistance(
            userCoords.lat,
            userCoords.lng,
            issue.location?.lat,
            issue.location?.lng
          );
          return distance <= 5; // 5 km radius
        });

        setNearbyIssues(issuesNearby);
        setStatus(
          issuesNearby.length > 0
            ? `Found ${issuesNearby.length} issues near you.`
            : "No issues found within 5km."
        );
      },
      () => {
        setStatus(
          "Could not get your location. Please enable location services to see nearby issues."
        );
      }
    );
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIssuePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const finalizeSubmission = (locationData) => {
    const newIssue = {
      id: `CIV-${String(Date.now()).slice(-4)}`,
      title: issueTitle,
      details: issueDetails,
      category: issueCategory,
      status: "New",
      photoUrl: photoPreview,
      rating: null,
      reporter: {
        name: user?.name || user?.username || "Anonymous",
        email: `${user?.username || "user"}@example.com`,
        phone: "9999999999",
      },
      location: locationData,
      date: new Date().toISOString().split("T")[0],
      assigned: false,
    };
    addIssue(newIssue);
    setNearbyIssues([...nearbyIssues, newIssue]);
    setMessage(`✅ Thank you! Your issue has been reported successfully.`);
    setIssueTitle("");
    setIssueDetails("");
    setIssueCategory("");
    setIssuePhoto(null);
    setPhotoPreview("");
    setIsSubmitting(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!issueTitle || !issueDetails || !issuePhoto || !issueCategory) {
      setMessage(
        "⚠️ Please fill all fields, select a category, and upload a photo."
      );
      return;
    }
    setIsSubmitting(true);
    setMessage("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        finalizeSubmission({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.warn("Could not get location:", error.message);
        alert(
          "Could not get location. The issue will be submitted without location data."
        );
        finalizeSubmission(null);
      }
    );
  };

  const categories = [
    "Roads",
    "Electricity",
    "Water Supply",
    "Waste Management",
    "Public Spaces",
    "Other",
  ];

  if (!currentLocation) {
    return (
      <div className="container mt-5 text-center">
        <h2>Nearby Issues</h2>
        <p className="alert alert-warning">{status}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="container mt-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">📍 Nearby Issues Dashboard</h2>
        <a href="/settings" className="btn btn-outline-secondary btn-sm">Settings</a>
      </div>
      <p className="text-center text-muted">{status}</p>

      {/* Report Form */}
      <div className="card shadow-sm p-4 mb-4">
        <h5 className="mb-3">Report a New Issue</h5>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="issueCategory" className="form-label fs-5">
              <CardText className="me-2" />
              Category
            </label>
            <select
              id="issueCategory"
              className="form-select"
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              required
            >
              <option value="" disabled>
                -- Select issue category --
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="issueTitle" className="form-label fs-5">
              Issue Title
            </label>
            <input
              type="text"
              className="form-control"
              id="issueTitle"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="issueDetails" className="form-label fs-5">
              Detailed Description
            </label>
            <textarea
              className="form-control"
              id="issueDetails"
              rows="4"
              value={issueDetails}
              onChange={(e) => setIssueDetails(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="issuePhoto" className="form-label fs-5">
              <Image className="me-2" />
              Upload Photo
            </label>
            <input
              type="file"
              className="form-control"
              id="issuePhoto"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="img-fluid rounded mt-3"
                style={{ maxHeight: "200px" }}
              />
            )}
          </div>
          {message && (
            <div
              className={`alert ${
                message.includes("successfully")
                  ? "alert-success"
                  : "alert-info"
              } fs-6`}
              role="alert"
            >
              {message}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Report Issue"}
          </button>
        </form>
      </div>

      {/* Map Section */}
      <div className="card shadow-sm">
        <MapContainer
          center={[currentLocation.lat, currentLocation.lng]}
          zoom={14}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[currentLocation.lat, currentLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
          {nearbyIssues.map((issue) => (
            <Marker
              key={issue.id}
              position={[issue.location.lat, issue.location.lng]}
            >
              <Popup>
                <b>{issue.title}</b>
                <br />
                {issue.details}
                <br />
                <span className="text-muted">Status: {issue.status}</span>
                {issue.status === 'Resolved' && (
                  <div className="mt-2">
                    <div className="mb-1">Rate the resolution:</div>
                    {[1,2,3,4,5].map(star => (
                      <button key={star} className={`btn btn-sm ${issue.rating>=star? 'btn-warning':'btn-outline-warning'}`} onClick={() => { setIssueRating(issue.id, star); setNearbyIssues([...nearbyIssues]); }}>
                        ★
                      </button>
                    ))}
                    {typeof issue.rating === 'number' && <span className="ms-2">{issue.rating}/5</span>}
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </motion.div>
  );
}

export default UserDashboard;
