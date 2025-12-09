const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const Admin = require('../model/adminModel')
    

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'czarcore_secret_key');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// const verifyAdmin = async (req, res, next) => {
//   console.log(req.user.userId);
  
//   const user = await Admin.findById(req.user.userId);
//   // console.log(user.role === 'admin');
//   console.log("user : ", user);
  
//   if ( user.role === 'admin') 
//   {
//     next();
//     return
//   }
// //  return res.status(403).json({ message: 'Admin access required' });
// };
       const verifyAdmin = async (req, res, next) => {
         try {
           console.log(req.user.userId);
           
           const user = await Admin.findOne({ userId: req.user.userId });
           console.log("user : ", user);
           
           if (!user || user.role !== 'admin') {
             return res.status(403).json({ message: 'Admin access required' });
           }
           
           next();
         } catch (error) {
           console.error('Admin verification error:', error);
           return res.status(500).json({ message: 'Internal server error' });
         }
       };
       


module.exports = { verifyToken, verifyAdmin };
