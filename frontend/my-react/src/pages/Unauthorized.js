function Unauthorized() {
  return (
    <div className="text-center mt-5">
      <h2 className="text-danger">🚫 Unauthorized Access</h2>
      <p>You do not have the necessary permissions to view this page.</p>
    </div>
  );
}

export default Unauthorized;