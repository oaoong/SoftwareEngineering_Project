from server.server import db
from flask import Blueprint, request , jsonify
from bson.json_util import dumps
from bson import ObjectId

follow_api = Blueprint('follow',__name__, url_prefix='/api/follow')


# 사용자 팔로우 버튼 처리
@follow_api.route('/', methods=["POST"])
def user_page():
    userFrom = request.get_json().get("userFrom")
    userTo = request.get_json().get("userTo") 

    follow_data = db.follow.find_one({"userFrom": userFrom, "userTo": userTo})
    if (follow_data != None):
         return jsonify({"success": True, "follow": True })
    else:
         return jsonify({"success": True, "follow": False })


# 사용자 팔로우 하기
@follow_api.route('/followUser', methods=["POST"])
def set_folow():
    userFrom = request.get_json().get("userFrom")
    userTo = request.get_json().get("userTo") 

    follow_data = db.follow.find_one({"userFrom": userFrom, "userTo": userTo})
    if (follow_data != None):
        db.follow.delete_one({"userFrom": userFrom, "userTo": userTo})    
        return jsonify({"success": True, "follow": False })
 
    else:
        db.follow.insert_one({"userFrom": userFrom, "userTo": userTo})
        return jsonify({"success": True, "follow": True })


# follow 페이지 렌더링
@follow_api.route('/productsByFollow', methods=["POST"])
def product_by_follow():
    data = request.get_json()
    limit = int(data["limit"]) if data["limit"] else 100
    skip = int(data["skip"]) if data["skip"] else 0

    follow_datas = db.follow.find({"userFrom": data.get("user")})
    follow_datas = list(follow_datas)
    
    query = {}
    search_list = []
    for follow_data in follow_datas:
        post_user_id = follow_data['userTo']
        search_list.append(post_user_id)
        
    if len(search_list) > 0: # 만약 팔로우한 사람이 있을 때
        query = {"writer": {'$in': search_list}}
        products_info = list(db.products.find(query).skip(skip).limit(limit))
        postSize = db.products.count_documents(query, skip = skip , limit = limit)

        for i in range(0,len(products_info)):
            writer_id = products_info[i].get("writer")
            user = db.user.find_one({"_id": ObjectId(writer_id)})
            products_info[i]["userName"] = user.get("name")
        
        if (products_info != None):
            return jsonify({
                'product': dumps(products_info),
                'postSize': postSize,
                'success': True
                })

    return jsonify({'success': False})
