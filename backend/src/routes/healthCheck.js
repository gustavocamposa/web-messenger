const healthCheck = (req, res) => {
  console.log("GET /health" + new Date().toLocaleString());

  res.status(200).json({
    timestamp: new Date(),
    uptime: process.uptime(),
  });
};

export default healthCheck;
