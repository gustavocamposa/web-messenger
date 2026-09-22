const healthCheck = (req, res) => {
  console.log("GET /health" + new Date().toLocaleString());

  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
};

export default healthCheck;
