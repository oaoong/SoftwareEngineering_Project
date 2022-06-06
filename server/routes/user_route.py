from server.server import db
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from bson import ObjectId
import bcrypt
import jwt


user_api = Blueprint('user',__name__, url_prefix='/api/user')

# 회원 가입하기
@user_api.route('/register',methods=["POST"])
def registerUser():
    data = request.get_json()
    email = data['email']
    password = data['password']
    name = data['name']
    
    user = db.user.find_one({"email": email})
    if user is None:
        new_password = str(bcrypt.hashpw(password.encode('UTF-8'),bcrypt.gensalt()), 'utf-8')
    
        db.user.insert_one({"email":email, "password":new_password,"name":name})
    
        return jsonify({"success": True})    
    else:
        return jsonify({"success": False})

# 로그인 하기
@user_api.route('/login',methods=["POST"])
def loginUser():
    data = request.get_json()
    email = data['email']
    password = data['password']
    user = db.user.find_one({"email":email})
    
    if user is None:
        return jsonify({ 'loginSuccess': False, 'message': "Email not found" })
    
    if user and bcrypt.checkpw(password.encode('UTF-8'), user['password'].encode('UTF-8')):
        user_id = user['_id']
        payload = {
            'user_id': str(user_id),
            'exp': datetime.utcnow() + timedelta(seconds= 60 * 60 * 24) #24시간
        }
        token = jwt.encode(payload, 'secret', 'HS256')
        db.user.find_one_and_update({"_id":user_id},{'$set':{"token": token}})
        
        res = jsonify({
            'loginSuccess': True,
            'userId': str(user_id),
        })
        res.set_cookie('w_auth', token)
        return res
    else:
        return jsonify({ 'loginSuccess': False, 'message': "Wrong Password" }) 
        
# 로그인 상태 확인
@user_api.route('/auth',methods=["GET"])
def auth():
    token = request.cookies.get('w_auth')
    if token is not None:
        decode = jwt.decode(token, 'secret', 'HS256')
        uid = decode['user_id']
        user = db.user.find_one({"_id": ObjectId(uid)})
        return jsonify({
            '_id': str(user['_id']),
            'isAuth': True,
            'email': user['email'],
            'name': user['name'],
        })
    else:
        return "token is nothing"

#로그아웃   
@user_api.route('/logout',methods=["GET"])
def logoutUser():
    token = request.cookies.get('w_auth')
    decode = jwt.decode(token, 'secret', 'HS256')
    uid = decode['user_id']
    user = db.user.find_one({"_id": ObjectId(uid)})
    db.user.find_one_and_update({"_id":ObjectId(user["_id"])},{'$set':{"token":""}})
    res = jsonify({'isAuth': False,'error': True})
    res.delete_cookie('w_auth')
    return res, 200 
    
