
const adminAuth = (req,res,next) => {
    console.log("Auth is getting checked");
    const token ="xyz";
    const isAdminAuthorized = "xyz";
    if(isAdminAuthorized == token){
        next();
    }else{
        res.status(401).send("Unauthorized access");
    }
};

module.exports = { adminAuth };

