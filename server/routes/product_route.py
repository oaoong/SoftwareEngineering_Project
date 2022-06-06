from server.server import *
from flask import Blueprint, request, jsonify ,send_from_directory , url_for
from asyncio.windows_events import NULL
from bson import ObjectId
from bson.json_util import dumps
from string import ascii_lowercase, ascii_uppercase, digits
import random

product_api = Blueprint('product',__name__, url_prefix='/api/product')

# 상품 정보 db에 저장
@product_api.route('/',methods=["POST"])
def product_upload():
    
    data = request.get_json()
    
    db.products.insert_one({"writer": data["writer"], 
                        "images": data["images"],
                        "title": data["title"], 
                        "description": data["description"],
                        "price" : data["price"],
                        "category" : int(data["category"]), 
                        "sold" : False, 
                        })
    return jsonify({"success": True})


# ---------------------------------------------------------------
# 이미지 파일 형식인지 확인
def allowed_file(filename): 
    return "." in filename and filename.rsplit(".",1)[1] in ALLOWED_EXTENSIONS

# 랜덤 문자열 생성
def rand_generator(length = 8): 
    char = ascii_lowercase + ascii_uppercase + digits
    return "".join(random.sample(char, length))

# static/image 폴더에 상품 image 저장
@product_api.route('/image',methods=["POST"])
def product_image_save():

    if request.method == "POST":
        file = request.files["file"]
        if file and allowed_file(file.filename):
            filename = "{}.jpg".format(rand_generator()) # 랜덤문자열.jpg로 생성 
            savefilepath = os.path.join(app.config["IMAGE_PATH"], filename) # 절대경로 생성
            file.save(savefilepath) #file을 해당 절대경로에 저장
            
            filePath = url_for("product.product_images", filename= filename)[1:]
            return jsonify({"success": True, "filePath": filePath, "fileName" : filename })

# static/image 폴더에서 상품 image 로드
@product_api.route("/images/<filename>", methods=["GET"]) 
def product_images(filename):
    return send_from_directory(os.path.abspath(app.config["IMAGE_PATH"]), filename)

# ---------------------------------------------------------------
# 상품 판매 완료 처리
@product_api.route('/setSold',methods=["POST"])
def set_sold():
    product_id = request.get_json()
    prod = db.products.find_one({"_id":ObjectId(product_id["id"])})
    db.products.update_one({"_id":ObjectId(product_id["id"])},{"$set": {"sold": not prod["sold"]}})
    return jsonify({"success": True, "sold": not prod["sold"]})

# main 페이지 렌더링
@product_api.route('/products',methods=["POST"])
def product_info_all():
    data = request.get_json()
    limit = int(data["limit"]) if data["limit"] else 100
    skip = int(data["skip"]) if data["skip"] else 0
    
    products_info = list(db.products.find().skip(skip).limit(limit))
    postSize = db.products.count_documents({}, skip = skip , limit = limit)

    for i in range(0,len(products_info)):
        writer_id = products_info[i].get("writer")
        user = db.user.find_one({"_id": ObjectId(writer_id)})
        products_info[i]["userName"] = user.get("name")
    
    for key in data.keys():
        if key == "filters":
            if len(data["filters"]["category"])>0:
                products_info = list(db.products.find({"category":{"$in":list(data["filters"]["category"])}}).skip(skip).limit(limit))
                postSize = db.products.count_documents({"category":{"$in":list(data["filters"]["category"])}}, skip = skip , limit = limit)

                for i in range(0,len(products_info)):
                    writer_id = products_info[i].get("writer")
                    user = db.user.find_one({"_id": ObjectId(writer_id)})
                    products_info[i]["userName"] = user.get("name")
                    
    if (products_info != NULL):
        return jsonify({
            'product': dumps(products_info),
            'postSize': postSize
            })
        
# mypage 페이지 렌더링  
@product_api.route('/productsByUser',methods=["POST"])
def product_by_user():
    data = request.get_json()
    limit = int(data["limit"]) if data["limit"] else 100
    skip = int(data["skip"]) if data["skip"] else 0
    
    products_info = list(db.products.find({"writer":data.get("user")}).skip(skip).limit(limit))
    postSize = db.products.count_documents({"writer":data.get("user")}, skip = skip , limit = limit)
    
    for i in range(0,len(products_info)):
        writer_id = products_info[i].get("writer")
        user = db.user.find_one({"_id": ObjectId(writer_id)})
        products_info[i]["userName"] = user.get("name")
    
    if (products_info != NULL):
        return jsonify({
            'product': dumps(products_info),
            'postSize': postSize
            })

# 상세 페이지 렌더링
@product_api.route('/products_by_id/<product_id>',methods=["GET"])
def product_info(product_id):
    product = db.products.find_one({"_id": ObjectId(product_id)}) 
    
    if (product != NULL):
        return jsonify({'product': dumps(product)})
    else:
        return 'error to get product'

# 수정 페이지에서 이전 상품 정보 불러오기
@product_api.route("/getEditProduct/<product_id>", methods=["POST"])
def get_edit_product(product_id):
    product = db.products.find_one({"_id":ObjectId(product_id)})

    return jsonify(dumps(product))

# 상품 정보 수정하기
@product_api.route("/editProduct/<product_id>", methods=["POST"])
def edit_product(product_id):
    data = request.get_json()
    db.products.update_one({"_id": ObjectId(product_id)},{
                "$set" : {
                    "images": data["images"],
                    "title": data["title"], 
                    "description": data["description"],
                    "price" : data["price"],
                    "category" : int(data["category"]),
                    "sold" : False, 
                    }
                })
    return jsonify({"success": True})

# 상품 정보의 작성자 이름 불러오기
@product_api.route("/getWriterName", methods=["POST"])
def get_product_username():
    data = request.get_json()
    writer_id = data.get("writerID")
    
    user = db.user.find_one({"_id": ObjectId(writer_id)})
    
    if (user !=None):
        return jsonify({
            "success": True,
            "writerName": user.get("name")
            })
    return jsonify({
            "success": False,
            })


