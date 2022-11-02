require('dotenv').config()
if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: `mongodb+srv://blogapp:${process.env.ACCESS_SECRET }@url-shotner-da-dio.yxyyj.mongodb.net/?retryWrites=true&w=majority`}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}