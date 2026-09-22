const healthCheck = (req, res) => {
  res.status(200).json({
    timestamp: new Date(),
    uptime: process.uptime(),
  });
};

export default healthCheck;
